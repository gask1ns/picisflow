import { webhookCallback } from "grammy/web";
import { Bot, InlineKeyboard } from "grammy";
import { handleStart } from "@/lib/telegram/commands/start";
import { handleCatat, processTransaction } from "@/lib/telegram/commands/catat";
import { handleBatal } from "@/lib/telegram/commands/batal";
import { handleList } from "@/lib/telegram/commands/list-transaksi";
import { handleStats } from "@/lib/telegram/commands/stats";
import { handleHelp } from "@/lib/telegram/commands/help";
import { handleNabung } from "@/lib/telegram/commands/nabung";
import { handleExport, handleExportCallback } from "@/lib/telegram/commands/export";
import { parseTransaction } from "@/lib/telegram/parser";
import { parseSMS } from "@/lib/telegram/regexParser";
import { setSession, clearSession, getSession } from "@/lib/telegram/session";
import { wibDate, wibWeekRange } from "@/lib/telegram/wib";
import { createServiceClient } from "@/lib/supabase/server";

let bot: Bot | null = null;
let handler: ((req: Request) => Promise<Response>) | null = null;

function ensureBot(): (req: Request) => Promise<Response> {
  if (!handler) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");
    bot = new Bot(token);

    bot.command("start", handleStart);
    bot.command("catat", handleCatat);
    bot.command("batal", handleBatal);
    bot.command("list", handleList);
    bot.command("stats", handleStats);
    bot.command("help", handleHelp);
    bot.command("nabung", handleNabung);
    bot.command("export", handleExport);

    // Callback queries
    bot.on("callback_query:data", async (ctx) => {
      const data = ctx.callbackQuery.data;
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      const supabase = createServiceClient();
      const { data: link } = await supabase
        .from("telegram_links")
        .select("user_id")
        .eq("telegram_chat_id", chatId)
        .single();
      if (!link) return;

      // Category selected → ask for amount
      if (data.startsWith("cat_")) {
        const catId = data.replace("cat_", "");
        const { data: cat } = await supabase
          .from("categories")
          .select("id, name, icon, type")
          .eq("id", catId)
          .single();
        if (cat) {
          await setSession(chatId, { user_id: link.user_id, category_id: cat.id, step: "amount" });
          const kb = new InlineKeyboard().text("🔙 Batal", "cancel_flow");
          try { await ctx.editMessageText(`Kategori: ${cat.icon ?? "📄"} ${cat.name}\n\nKirim nominalnya:`); } catch {}
          try { await ctx.editMessageReplyMarkup({ reply_markup: kb }); } catch {}
        }
        try { await ctx.answerCallbackQuery(); } catch {}
        return;
      }

      // Income flow
      if (data === "income_flow") {
        await setSession(chatId, { user_id: link.user_id, category_id: null, step: "income_amount" });
        const kb = new InlineKeyboard().text("🔙 Batal", "cancel_flow");
        try { await ctx.editMessageText("💰 *Pemasukan*\n\nKirim nominalnya:", { parse_mode: "Markdown" as const }); } catch {}
        try { await ctx.editMessageReplyMarkup({ reply_markup: kb }); } catch {}
        try { await ctx.answerCallbackQuery(); } catch {}
        return;
      }

      // Cancel flow
      if (data === "cancel_flow") {
        await clearSession(chatId);
        try { await ctx.deleteMessage(); } catch {}
        try { await ctx.answerCallbackQuery(); } catch {}
        return;
      }

      // Delete transaction
      if (data.startsWith("del_")) {
        const txId = data.replace("del_", "");
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", txId)
          .eq("user_id", link.user_id);
        if (!error) {
          try { await ctx.editMessageText("🗑️ Transaksi dihapus.", { reply_markup: undefined }); } catch {}
        }
        try { await ctx.answerCallbackQuery(); } catch {}
        return;
      }

      if (data.startsWith("edit_")) {
        const txId = data.replace("edit_", "");
        const { data: tx } = await supabase
          .from("transactions")
          .select("*")
          .eq("id", txId)
          .single();
        if (tx) {
          await setSession(chatId, { user_id: link.user_id, step: "edit", edit_tx_id: txId });
          try {
            await ctx.editMessageText(
              `💰 *Edit Transaksi*\n\n` +
              `Jumlah saat ini: Rp${Number(tx.amount).toLocaleString("id-ID")}\n\n` +
              `Kirim nomor baru buat ganti jumlah.`,
              { parse_mode: "Markdown" as const, reply_markup: new InlineKeyboard().text("🔙 Batal", "cancel_flow") }
            );
          } catch {}
        }
        try { await ctx.answerCallbackQuery(); } catch {}
        return;
      }

      // Nabung: select goal → ask amount
      if (data.startsWith("nabung_") && !data.startsWith("nabung_new")) {
        const parts = data.replace("nabung_", "").split("_");
        const goalId = parts[0];
        const presetAmount = parts.length > 1 ? parseInt(parts[1]) : null;

        if (presetAmount) {
          const supabase = createServiceClient();
          const { data: goal } = await supabase
            .from("savings_goals")
            .select("*")
            .eq("id", goalId)
            .single();
          if (goal) {
            const newAmount = Math.min(Number(goal.current_amount) + presetAmount, Number(goal.target_amount));
            await supabase.from("savings_goals").update({ current_amount: newAmount }).eq("id", goalId);
            const pct = Math.round((newAmount / Number(goal.target_amount)) * 100);
            try {
              await ctx.editMessageText(
                `✅ Rp${presetAmount.toLocaleString("id-ID")} ditambahkan ke *${goal.name}*\n` +
                `Rp${newAmount.toLocaleString("id-ID")} / Rp${Number(goal.target_amount).toLocaleString("id-ID")} (${pct}%)`,
                { parse_mode: "Markdown" as const }
              );
            } catch {}
          }
        } else {
          await setSession(chatId, { user_id: link.user_id, step: "nabung", goal_id: goalId });
          try {
            await ctx.editMessageText("Kirim nominal buat ditambahkan:", {
              reply_markup: new InlineKeyboard().text("🔙 Batal", "cancel_flow"),
            });
          } catch {}
        }
        try { await ctx.answerCallbackQuery(); } catch {}
        return;
      }

      if (data === "nabung_new") {
        try {
          await ctx.editMessageText(
            "Buat target baru. Kirim:\n/nabung <nama> <jumlah>\n\n" +
            "Contoh: /nabung Laptop 10000000"
          );
        } catch {}
        try { await ctx.answerCallbackQuery(); } catch {}
        return;
      }

      // Export period selection
      if (data.startsWith("export_")) {
        await handleExportCallback(ctx, data);
        return;
      }

      try { await ctx.answerCallbackQuery(); } catch {}
    });

    // Plain text handling: if user has a pending session
    bot.on("message:text", async (ctx) => {
      const text = ctx.message.text;
      if (text.startsWith("/")) return;

      const chatId = ctx.chat?.id;
      if (!chatId) return;

      // Check pending session
      const session = await getSession(chatId);

      if (session?.step === "edit") {
        const supabase = createServiceClient();
        const amount = parseInt(text.replace(/[.,\s]/g, ""), 10);
        if (isNaN(amount) || amount <= 0) {
          await ctx.reply("Nominal gak valid. Coba lagi.");
          return;
        }
        const { error } = await supabase
          .from("transactions")
          .update({ amount })
          .eq("id", session.edit_tx_id)
          .eq("user_id", session.user_id);
        await clearSession(chatId);
        if (error) {
          await ctx.reply("Gagal update. Coba lagi.");
          return;
        }
        await ctx.reply(`✅ Jumlah berhasil diubah ke Rp${amount.toLocaleString("id-ID")}`);
        return;
      }

      if (session?.step === "nabung") {
        const supabase = createServiceClient();
        const amount = parseInt(text.replace(/[.,\s]/g, ""), 10);
        if (isNaN(amount) || amount <= 0) {
          await ctx.reply("Nominal gak valid. Coba lagi.");
          return;
        }
        const { data: goal } = await supabase
          .from("savings_goals")
          .select("*")
          .eq("id", session.goal_id)
          .single();
        if (goal) {
          const newAmount = Math.min(Number(goal.current_amount) + amount, Number(goal.target_amount));
          await supabase.from("savings_goals").update({ current_amount: newAmount }).eq("id", goal.id);
          const pct = Math.round((newAmount / Number(goal.target_amount)) * 100);
          await ctx.reply(
            `✅ Rp${amount.toLocaleString("id-ID")} ditambahkan ke *${goal.name}*\n` +
            `Rp${newAmount.toLocaleString("id-ID")} / Rp${Number(goal.target_amount).toLocaleString("id-ID")} (${pct}%)`,
            { parse_mode: "Markdown" as const }
          );
        }
        await clearSession(chatId);
        return;
      }

      if (session && (session.step === "amount" || session.step === "income_amount")) {
        const supabase = createServiceClient();
        const amount = parseInt(text.replace(/[.,\s]/g, ""), 10);
        if (isNaN(amount) || amount <= 0) {
          await ctx.reply("Nominal gak valid. Coba lagi atau kirim /batal.");
          return;
        }

        const type = session.step === "income_amount" ? "income" : "expense";
        const cat = session.category_id
          ? (await supabase.from("categories").select("name").eq("id", session.category_id).single()).data
          : null;

        const { error } = await supabase.from("transactions").insert({
          user_id: session.user_id,
          category_id: session.category_id,
          type,
          amount,
          date: wibDate(),
          source: "telegram",
        });

        await clearSession(chatId);

        if (error) {
          await ctx.reply("Gagal nyimpen. Coba lagi.");
          return;
        }

        // Budget check
        let budgetMsg = "";
        if (session.category_id && type === "expense") {
          const { data: bCat } = await supabase
            .from("categories")
            .select("name, monthly_budget, budget_period")
            .eq("id", session.category_id)
            .single();
          if (bCat?.monthly_budget) {
            const period = bCat.budget_period ?? "monthly";
            const dateGte = period === "weekly"
              ? wibWeekRange().start
              : wibDate().slice(0, 7) + "-01";
            const dateLte = period === "weekly" ? wibWeekRange().end : undefined;
            let query = supabase
              .from("transactions")
              .select("amount")
              .eq("user_id", session.user_id)
              .eq("category_id", session.category_id)
              .gte("date", dateGte);
            if (dateLte) query = query.lte("date", dateLte);
            const { data: sumData } = await query;
            const total = sumData?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
            const pct = Math.round((total / Number(bCat.monthly_budget)) * 100);
            const periodLabel = period === "weekly" ? " minggu ini" : "";
            if (pct >= 100) budgetMsg = `\n⚠️ Budget ${bCat.name}${periodLabel} udah habis! (${pct}%)`;
            else if (pct >= 80) budgetMsg = `\n⚠️ Budget ${bCat.name}${periodLabel} udah ${pct}%!`;
          }
        }

        const typeLabel = type === "income" ? "Pemasukan" : "Pengeluaran";
        const emoji = type === "income" ? "💰" : "💸";
        await ctx.reply(
          `📊 *Transaksi Berhasil Dicatat*\n\n` +
          `${emoji} Rp${amount.toLocaleString("id-ID")}\n` +
          `${cat ? `📂 ${cat.name}` : "📂 Tanpa kategori"}\n` +
          `📅 ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` +
          budgetMsg,
          { parse_mode: "Markdown" as const }
        );
        return;
      }

      // Try SMS bank/ewallet regex parser first
      const smsParsed = parseSMS(text);
      if (smsParsed) {
        const supabase = createServiceClient();
        const { data: link } = await supabase
          .from("telegram_links")
          .select("user_id, is_verified")
          .eq("telegram_chat_id", chatId)
          .single();

        if (link?.is_verified) {
          const catHint = smsParsed.categoryHint ?? "Lainnya (Expense)";
          await processTransaction(ctx, link.user_id, catHint, smsParsed.amount, smsParsed.description ?? "");
        }
        return;
      }

      // Normal flow: try to parse and save
      const parsed = parseTransaction(text);
      if (!parsed) return;

      const supabase = createServiceClient();
      const { data: link } = await supabase
        .from("telegram_links")
        .select("user_id, is_verified")
        .eq("telegram_chat_id", chatId)
        .single();

      if (!link?.is_verified) return;

      await processTransaction(ctx, link.user_id, parsed.category, parsed.amount, parsed.description);
    });

    handler = webhookCallback(bot, "std/http") as (req: Request) => Promise<Response>;
  }
  return handler;
}

export const POST = async (request: Request) => {
  const text = await request.text();
  let body: { update_id?: number } | null = null;
  try { body = JSON.parse(text); } catch { /* ignore */ }

  if (body?.update_id) {
    const supabase = createServiceClient();
    const { data: existing } = await supabase
      .from("processed_updates")
      .select("update_id")
      .eq("update_id", body.update_id)
      .single();

    if (existing) {
      return new Response("OK", { status: 200 });
    }

    const result = await ensureBot()(new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: text,
    }));

    await supabase.from("processed_updates").insert({ update_id: body.update_id });
    return result;
  }

  return ensureBot()(new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: text,
  }));
};
