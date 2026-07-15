import { createServiceClient } from "@/lib/supabase/server";
import type { Context } from "grammy";

export async function handleBatal(ctx: Context) {
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
  const args = text.replace("/batal", "").trim();
  let limit = 1;

  if (args) {
    if (args === "all") {
      limit = 999;
    } else {
      const n = parseInt(args, 10);
      if (!isNaN(n) && n > 0 && n <= 50) limit = n;
    }
  }

  const { data: txs } = await supabase
    .from("transactions")
    .select("id, amount, description, created_at")
    .eq("user_id", link.user_id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!txs?.length) {
    await ctx.reply("Belum ada transaksi yang bisa dibatalkan.");
    return;
  }

  const ids = txs.map((t) => t.id);
  const { error } = await supabase
    .from("transactions")
    .delete()
    .in("id", ids);

  if (error) {
    await ctx.reply("Gagal membatalkan transaksi. Coba lagi.");
    return;
  }

  const totalAmount = txs.reduce((s, t) => s + Number(t.amount), 0);
  await ctx.reply(
    `✅ ${txs.length} transaksi dibatalkan (total Rp${totalAmount.toLocaleString("id-ID")}).`
  );
}
