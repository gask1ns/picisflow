import { createServiceClient } from "@/lib/supabase/server";
import type { Context } from "grammy";
import { wibDate, wibNow } from "@/lib/telegram/wib";

export async function handleList(ctx: Context) {
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
  const args = text.replace("/list", "").trim().toLowerCase();
  const today = wibDate();

  let dateFrom = today;
  let categoryFilter: string | null = null;

  if (args) {
    // Check if it's a number (days)
    const days = parseInt(args, 10);
    if (!isNaN(days) && days > 0) {
      const d = wibNow();
      d.setDate(d.getDate() - days);
      dateFrom = d.toLocaleDateString("en-CA");
    } else if (args === "bulan ini") {
      const now = wibNow();
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA");
    } else {
      // Try to match as category name
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name")
        .or(`user_id.eq.${link.user_id},user_id.is.null`);

      const match = cats?.find((c) => c.name.toLowerCase() === args || c.name.toLowerCase().includes(args));
      if (match) {
        categoryFilter = match.id;
      }
    }
  }

  let q = supabase
    .from("transactions")
    .select("type, amount, description, date, categories(name, icon)")
    .eq("user_id", link.user_id)
    .gte("date", dateFrom);

  if (categoryFilter) q = q.eq("category_id", categoryFilter);

  const { data: tx } = await q
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<Array<{
      type: string;
      amount: number;
      description: string | null;
      date: string;
      categories: { name: string; icon: string | null } | null;
    }>>();

  if (!tx?.length) {
    await ctx.reply("Belum ada transaksi di periode ini.");
    return;
  }

  const lines = tx.map((t, i) => {
    const emoji = t.categories?.icon ?? "📄";
    const catName = t.categories?.name ?? "";
    const sign = t.type === "income" ? "+" : "-";
    const d = new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const desc = t.description ? ` — ${t.description}` : "";
    return `${i + 1}. ${d} ${emoji} ${catName} ${sign}Rp${Number(t.amount).toLocaleString("id-ID")}${desc}`;
  });

  const totalIncome = tx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = tx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const header = categoryFilter
    ? `📋 *Transaksi ${tx[0]?.categories?.name ?? ""}*\n`
    : `📋 *Transaksi Terbaru*\n`;

  const msg =
    header +
    lines.join("\n") +
    `\n\nTotal: -Rp${totalExpense.toLocaleString("id-ID")} + Rp${totalIncome.toLocaleString("id-ID")}`;

  await ctx.reply(msg, { parse_mode: "Markdown" as const });
}
