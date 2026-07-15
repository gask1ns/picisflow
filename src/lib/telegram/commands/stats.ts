import { createServiceClient } from "@/lib/supabase/server";
import type { Context } from "grammy";
import { wibNow } from "@/lib/telegram/wib";

export async function handleStats(ctx: Context) {
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

  const now = wibNow();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toLocaleDateString("en-CA");

  const monthName = now.toLocaleString("id-ID", { month: "long" });
  const year = now.getFullYear();

  const { data: tx } = await supabase
    .from("transactions")
    .select("type, amount, categories(name, icon)")
    .eq("user_id", link.user_id)
    .gte("date", firstDay)
    .order("amount", { ascending: false })
    .returns<Array<{
      type: string;
      amount: number;
      categories: { name: string; icon: string | null } | null;
    }>>();

  if (!tx?.length) {
    await ctx.reply(`Belum ada transaksi di bulan ${monthName}.`);
    return;
  }

  const totalIncome = tx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = tx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const byCat: Record<string, { icon: string | null; amount: number }> = {};
  for (const t of tx) {
    if (t.type !== "expense") continue;
    const name = t.categories?.name ?? "Tanpa kategori";
    if (!byCat[name]) byCat[name] = { icon: t.categories?.icon ?? null, amount: 0 };
    byCat[name].amount += Number(t.amount);
  }

  const topCats = Object.entries(byCat)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 5);

  let msg =
    `📊 *Laporan ${monthName} ${year}*\n\n` +
    `💰 Pemasukan: +Rp${totalIncome.toLocaleString("id-ID")}\n` +
    `💸 Pengeluaran: -Rp${totalExpense.toLocaleString("id-ID")}\n` +
    `Saldo: Rp${(totalIncome - totalExpense).toLocaleString("id-ID")}`;

  if (topCats.length) {
    msg += `\n\n*Top Pengeluaran:*\n`;
    msg += topCats
      .map(
        ([name, data], i) =>
          `${i + 1}. ${data.icon ?? "📄"} ${name} — Rp${data.amount.toLocaleString("id-ID")}`
      )
      .join("\n");
  }

  if (msg.length > 4000) {
    msg = msg.slice(0, 3997) + "...";
  }

  await ctx.reply(msg, { parse_mode: "Markdown" as const });
}
