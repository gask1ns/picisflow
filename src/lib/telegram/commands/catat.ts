import { createServiceClient } from "@/lib/supabase/server";
import { parseTransaction } from "@/lib/telegram/parser";
import type { Context } from "grammy";
import { InlineKeyboard } from "grammy";
import { getSession, clearSession } from "@/lib/telegram/session";
import { wibDate, wibNow, wibWeekRange } from "@/lib/telegram/wib";

const SKIP_WORDS = new Set([
  "beli", "bayar", "transfer", "isi", "topup", "top", "up",
  "habis", "belanja", "pesan", "order", "booking", "sewa",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((w) => w.length > 1 && !SKIP_WORDS.has(w));
}

function scoreCategory(category: string, tokens: string[], aliases: string[]): number {
  let score = 0;
  if (tokens.includes(category.toLowerCase())) score += 5;
  for (const token of tokens) {
    for (const alias of aliases) {
      const a = alias.toLowerCase();
      if (a === token) { score += 3; continue; }
      if (a.includes(token) && a.split(" ").length > 1) { score += 1; continue; }
      if (token.length > a.length + 1 && token.includes(a)) { score += 2; }
    }
  }
  return score;
}

function findBestMatch(
  categoryInput: string,
  cats: { id: string; type: string; name: string; aliases: string[] }[]
): { id: string; type: string; name: string } | null {
  if (!cats?.length) return null;
  const tokens = tokenize(categoryInput);
  if (!tokens.length) return null;
  const exact = cats.find((c) => c.name.toLowerCase() === categoryInput.toLowerCase());
  if (exact) return exact;
  const scored = cats
    .map((c) => ({ cat: c, score: scoreCategory(c.name, tokens, c.aliases ?? []) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.length ? scored[0].cat : null;
}

export async function handleCatat(ctx: Context) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const supabase = createServiceClient();

  const { data: link } = await supabase
    .from("telegram_links")
    .select("user_id, is_verified")
    .eq("telegram_chat_id", chatId)
    .single();

  if (!link?.is_verified) {
    await ctx.reply("Akun belum terhubung. /start <kode> dulu.");
    return;
  }

  const text = ctx.message?.text ?? "";
  const input = text.startsWith("/catat ") ? text.slice(7).trim() : text;

  // If no text after /catat → show inline keyboard
  if (!input || input === "/catat") {
    await showCategoryKeyboard(ctx, link.user_id);
    return;
  }

  const parsed = parseTransaction(input);
  if (!parsed) {
    await showCategoryKeyboard(ctx, link.user_id);
    return;
  }

  await processTransaction(ctx, link.user_id, parsed.category, parsed.amount, parsed.description);
}

export async function processTransaction(
  ctx: Context,
  userId: string,
  categoryInput: string,
  amount: number,
  description: string
) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const supabase = createServiceClient();

  const { data: cats } = await supabase
    .from("categories")
    .select("id, type, name, aliases")
    .or(`user_id.eq.${userId},user_id.is.null`);

  const match = findBestMatch(categoryInput, cats ?? []);

  // Auto-remove description if it matches category name
  let desc = description;
  if (!desc && match && categoryInput.toLowerCase() !== match.name.toLowerCase()) {
    desc = categoryInput;
  }
  if (desc && match && desc.toLowerCase() === match.name.toLowerCase()) {
    desc = "";
  }

  const type = match?.type ?? "expense";

  const { data: newTx, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      category_id: match?.id ?? null,
      type,
      amount,
      description: desc || null,
      date: wibDate(),
      source: "telegram",
    })
    .select("id")
    .single();

  if (error) {
    await ctx.reply("Gagal nyimpen transaksi. Coba lagi.");
    return;
  }

  // Budget check
  const now = wibNow();
  const { data: budgetData } = await supabase
    .from("categories")
    .select("monthly_budget, budget_period")
    .eq("id", match?.id)
    .single();

  let budgetMsg = "";
  if (budgetData?.monthly_budget && match?.id) {
    const period = budgetData.budget_period ?? "monthly";
    const dateGte = period === "weekly"
      ? wibWeekRange().start
      : new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA");
    const dateLte = period === "weekly" ? wibWeekRange().end : undefined;

    let query = supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("category_id", match.id)
      .gte("date", dateGte);
    if (dateLte) query = query.lte("date", dateLte);
    const { data: sumData } = await query;
    const total = sumData?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    const pct = Math.round((total / Number(budgetData.monthly_budget)) * 100);
    const periodLabel = period === "weekly" ? "minggu ini" : "bulan ini";
    if (pct >= 100) {
      budgetMsg = `\n╰ ⚠️ Budget *${match.name}* (${periodLabel}) udah habis! (${pct}%)`;
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "budget_alert",
        title: `Budget ${match.name} udah habis!`,
        body: `Total pengeluaran ${periodLabel}: Rp${total.toLocaleString("id-ID")} dari budget Rp${Number(budgetData.monthly_budget).toLocaleString("id-ID")}`,
        link: "/categories",
      }).maybeSingle();
    } else if (pct >= 80) {
      budgetMsg = `\n╰ ⚠️ Budget *${match.name}* (${periodLabel}) udah ${pct}%!`;
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "budget_alert",
        title: `Budget ${match.name} udah ${pct}%`,
        body: `Sisa ${periodLabel}: Rp${(Number(budgetData.monthly_budget) - total).toLocaleString("id-ID")}`,
        link: "/categories",
      }).maybeSingle();
    }
  }

  const typeLabel = type === "income" ? "Pemasukan" : "Pengeluaran";
  const emoji = type === "income" ? "💰" : "💸";
  const sign = type === "income" ? "+" : "-";

  const keyboard = new InlineKeyboard()
    .text("💰 Edit", `edit_${newTx.id}`)
    .text("🗑️ Hapus", `del_${newTx.id}`);

  const lines = [
    `📊 *Transaksi Berhasil Dicatat*`,
    ``,
    `${emoji} Rp${amount.toLocaleString("id-ID")}`,
    `📂 ${match ? match.name : "Tanpa kategori"}`,
    `${desc ? `📝 ${desc}` : ""}`,
    `📅 ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    budgetMsg,
  ].filter(Boolean).join("\n");

  await ctx.reply(lines, {
    parse_mode: "Markdown" as const,
    reply_markup: keyboard,
  });
}

export async function showCategoryKeyboard(ctx: Context, userId: string) {
  const supabase = createServiceClient();
  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, icon, type")
    .or(`user_id.eq.${userId},user_id.is.null`)
    .eq("type", "expense")
    .order("name");

  if (!cats?.length) {
    await ctx.reply("Silakan kirim transaksi langsung, contoh:\nkopi 15000");
    return;
  }

  const kb = new InlineKeyboard();
  for (let i = 0; i < cats.length; i += 2) {
    if (i + 1 < cats.length) {
      kb.text(`${cats[i].icon ?? "📄"} ${cats[i].name}`, `cat_${cats[i].id}`).text(
        `${cats[i + 1].icon ?? "📄"} ${cats[i + 1].name}`,
        `cat_${cats[i + 1].id}`
      );
    } else {
      kb.text(`${cats[i].icon ?? "📄"} ${cats[i].name}`, `cat_${cats[i].id}`);
    }
  }
  kb.row().text("💰 Pemasukan", "income_flow");

  await ctx.reply("Pilih kategori:", { reply_markup: kb });
}
