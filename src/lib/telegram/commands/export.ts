import { createServiceClient } from "@/lib/supabase/server";
import type { Context } from "grammy";
import { InlineKeyboard } from "grammy";

export async function handleExport(ctx: Context) {
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

  const kb = new InlineKeyboard()
    .text("📅 Hari Ini", "export_today")
    .text("📅 7 Hari", "export_7d")
    .row()
    .text("📅 30 Hari", "export_30d")
    .text("📅 Bulan Ini", "export_month");

  await ctx.reply("📊 *Export Transaksi*\n\nPilih periode:", {
    parse_mode: "Markdown" as const,
    reply_markup: kb,
  });
}

async function generateToken(userId: string, days?: number) {
  const svc = createServiceClient();
  const from = days
    ? new Date(Date.now() - days * 86400000).toISOString().split("T")[0]
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  const { data: token } = await svc
    .from("export_tokens")
    .insert({
      user_id: userId,
      from_date: days ? from : undefined,
      to_date: undefined,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
    .select("token")
    .single();

  return { token: token?.token, from };
}

export async function handleExportCallback(ctx: Context, data: string) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const supabase = createServiceClient();
  const { data: link } = await supabase
    .from("telegram_links")
    .select("user_id")
    .eq("telegram_chat_id", chatId)
    .single();

  if (!link) {
    await ctx.answerCallbackQuery();
    return;
  }

  let days: number | undefined;
  if (data === "export_today") days = 1;
  else if (data === "export_7d") days = 7;
  else if (data === "export_30d") days = 30;
  else if (data === "export_month") days = undefined; // current month

  const result = await generateToken(link.user_id, days);

  if (result.token) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "";
    const url = `${origin}/api/transactions/export?token=${result.token}`;
    try {
      await ctx.editMessageText(
        `📥 *Download Transaksi*\n\n` +
        `Periode: ${days ? `${days} hari terakhir` : "Bulan ini"}\n` +
        `Link berlaku 5 menit.\n\n` +
        `[Download CSV](${url})`,
        { parse_mode: "Markdown" as const, reply_markup: undefined }
      );
    } catch {}
  } else {
    try {
      await ctx.editMessageText("Gagal generate link. Coba lagi.");
    } catch {}
  }

  await ctx.answerCallbackQuery();
}
