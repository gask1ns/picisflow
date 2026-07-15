import { createServiceClient } from "@/lib/supabase/server";
import type { Context } from "grammy";
import { wibNow } from "@/lib/telegram/wib";

export async function handleStart(ctx: Context) {
  const text = ctx.message?.text ?? "";
  const parts = text.split(" ");
  const code = parts[1]; // /start <code>

  if (!code) {
    await ctx.reply(
      "👋 Halo! Aku PicisFlow bot.\n\n" +
      "Gunakan /help untuk lihat cara pakai.\n\n" +
      "Kalau kamu punya kode verifikasi dari web, kirim:\n/start <kode>"
    );
    return;
  }

  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const supabase = createServiceClient();

  const { data: link } = await supabase
    .from("telegram_links")
    .select("*")
    .eq("verification_code", code)
    .gte("verification_code_expires_at", wibNow().toISOString())
    .single();

  if (!link) {
    await ctx.reply("Kode tidak valid atau sudah kadaluarsa. Generate ulang di web.");
    return;
  }

  const { error } = await supabase
    .from("telegram_links")
    .update({
      telegram_chat_id: chatId,
      telegram_username: ctx.from?.username ?? null,
      is_verified: true,
      verification_code: null,
      verification_code_expires_at: null,
    })
    .eq("id", link.id);

  if (error) {
    await ctx.reply("Gagal menghubungkan akun. Coba lagi.");
    return;
  }

  await ctx.reply("✅ Akun Telegram berhasil terhubung ke PicisFlow! Sekarang kamu bisa catat transaksi langsung di sini.");
}
