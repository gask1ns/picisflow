import { createServiceClient } from "@/lib/supabase/server";
import type { Context } from "grammy";
import { InlineKeyboard } from "grammy";

export async function handleNabung(ctx: Context) {
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
  const input = text.replace("/nabung", "").trim();

  // Direct format: /nabung Laptop 10000000
  if (input) {
    const parts = input.split(/\s+(.+)/);
    const name = parts[0];
    const amount = parseInt(parts[1]?.replace(/[.,\s]/g, ""), 10);

    if (name && !isNaN(amount) && amount > 0) {
      const { error } = await supabase.from("savings_goals").insert({
        user_id: link.user_id,
        name,
        target_amount: amount,
      });
      if (error) {
        await ctx.reply("Gagal bikin target. Coba lagi.");
        return;
      }
      await ctx.reply(
        `🎯 Target *${name}* dibuat!\n` +
        `Target: Rp${amount.toLocaleString("id-ID")}\n\n` +
        `Kirim /nabung buat isi saldo.`,
        { parse_mode: "Markdown" as const }
      );
      return;
    }

    // /nabung <amount> → top up goal terakhir
    const amt = parseInt(input.replace(/[.,\s]/g, ""), 10);
    if (!isNaN(amt) && amt > 0) {
      const { data: goals } = await supabase
        .from("savings_goals")
        .select("id, name, current_amount, target_amount")
        .eq("user_id", link.user_id)
        .eq("is_completed", false)
        .order("created_at", { ascending: false });

      if (!goals?.length) {
        await ctx.reply("Belum ada target. Buat dulu: /nabung <nama> <jumlah>");
        return;
      }

      if (goals.length === 1) {
        const g = goals[0];
        const newAmount = Math.min(Number(g.current_amount) + amt, Number(g.target_amount));
        await supabase.from("savings_goals").update({ current_amount: newAmount }).eq("id", g.id);
        const pct = Math.round((newAmount / Number(g.target_amount)) * 100);
        await ctx.reply(
          `✅ Rp${amt.toLocaleString("id-ID")} ditambahkan ke *${g.name}*\n` +
          `Rp${newAmount.toLocaleString("id-ID")} / Rp${Number(g.target_amount).toLocaleString("id-ID")} (${pct}%)`,
          { parse_mode: "Markdown" as const }
        );
        return;
      }

      // Multiple goals → pilih
      const kb = new InlineKeyboard();
      for (const g of goals) {
        const pct = Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100);
        kb.text(`${g.name} (${pct}%)`, `nabung_${g.id}_${amt}`);
      }
      kb.row().text("➕ Buat Baru", "nabung_new");
      await ctx.reply("Pilih target:", { reply_markup: kb });
      return;
    }
  }

  // No args → show goals list
  const { data: goals } = await supabase
    .from("savings_goals")
    .select("id, name, current_amount, target_amount")
    .eq("user_id", link.user_id)
    .eq("is_completed", false)
    .order("created_at", { ascending: false });

  if (!goals?.length) {
    await ctx.reply(
      "Belum ada target tabungan.\n\n" +
      "Buat: /nabung <nama> <jumlah>\n" +
      "Contoh: /nabung Laptop 10000000"
    );
    return;
  }

  const kb = new InlineKeyboard();
  for (const g of goals) {
    const pct = Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100);
    kb.text(`${g.name} (${pct}%)`, `nabung_${g.id}`);
  }
  kb.row().text("➕ Buat Baru", "nabung_new");
  await ctx.reply("🎯 Pilih target tabungan:", { reply_markup: kb });
}
