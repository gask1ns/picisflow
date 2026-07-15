import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getBot } from "@/lib/telegram/bot";
import { wibDate, wibDayOfWeek, wibDayOfMonth, wibNow } from "@/lib/telegram/wib";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = wibDate();
  const dayOfWeek = wibDayOfWeek();
  const dayOfMonth = wibDayOfMonth();

  // === 1. Recurring Transactions ===
  const { data: recurring } = await supabase
    .from("recurring_transactions")
    .select("*, telegram_links!inner(telegram_chat_id)")
    .eq("is_active", true)
    .or(
      `and(frequency.eq.daily,start_date.lte.${today},or(end_date.is.null,end_date.gte.${today})),` +
      `and(frequency.eq.weekly,day_of_week.eq.${dayOfWeek},start_date.lte.${today},or(end_date.is.null,end_date.gte.${today})),` +
      `and(frequency.eq.monthly,day_of_month.eq.${dayOfMonth},start_date.lte.${today},or(end_date.is.null,end_date.gte.${today})),` +
      `and(frequency.eq.yearly,day_of_month.eq.${dayOfMonth},extract(month from start_date).eq.${wibNow().getMonth() + 1},start_date.lte.${today},or(end_date.is.null,end_date.gte.${today}))`
    );

  if (recurring) {
    for (const r of recurring) {
      const { error } = await supabase.from("transactions").insert({
        user_id: r.user_id,
        category_id: r.category_id,
        type: r.type,
        amount: r.amount,
        description: r.description
          ? `${r.description} (recurring)`
          : "Transaksi otomatis",
        date: today,
        source: "web",
      });

      if (!error) {
        await supabase
          .from("recurring_transactions")
          .update({ last_generated_date: today })
          .eq("id", r.id);
        await supabase.from("notifications").insert({
          user_id: r.user_id,
          type: "recurring_generated",
          title: `Transaksi berulang: ${r.description ?? "Otomatis"}`,
          body: `Rp${Number(r.amount).toLocaleString("id-ID")} — ${r.frequency}`,
          link: "/transactions",
        }).maybeSingle();
      }
    }
  }

  // === 2. Debt Due Notifications ===
  const sevenDaysFromNow = new Date(wibNow().getTime() + 7 * 86400000).toISOString().split("T")[0];
  const { data: debtsDue } = await supabase
    .from("debts")
    .select("id, user_id, counterparty_name, amount, due_date, type")
    .eq("is_paid", false)
    .not("due_date", "is", null)
    .lte("due_date", sevenDaysFromNow);

  if (debtsDue) {
    for (const d of debtsDue) {
      const label = d.type === "owe" ? "Hutang" : "Piutang";
      await supabase.from("notifications").insert({
        user_id: d.user_id,
        type: "debt_due",
        title: `${label} dengan ${d.counterparty_name} jatuh tempo`,
        body: `Rp${Number(d.amount).toLocaleString("id-ID")} — jatuh ${new Date(d.due_date!).toLocaleDateString("id-ID")}`,
        link: "/debts",
      }).maybeSingle();
    }
  }

  // === 3. Scheduled Reports ===
  const isMonday = dayOfWeek === 1;
  const isFirstDay = dayOfMonth === 1;

  if (isMonday || isFirstDay) {
    const { data: links } = await supabase
      .from("telegram_links")
      .select("user_id, telegram_chat_id");

    if (links) {
      const bot = getBot();

      for (const link of links) {
        if (!link.telegram_chat_id) continue;

        const periodStart = isFirstDay
          ? `${wibNow().getFullYear()}-${String(wibNow().getMonth() + 1).padStart(2, "0")}-01`
          : new Date(wibNow().getTime() - 7 * 86400000).toLocaleDateString("en-CA");

        const { data: tx } = await supabase
          .from("transactions")
          .select("type, amount")
          .eq("user_id", link.user_id)
          .gte("date", periodStart);

        const income =
          tx
            ?.filter((t) => t.type === "income")
            .reduce((s, t) => s + Number(t.amount), 0) ?? 0;
        const expense =
          tx
            ?.filter((t) => t.type === "expense")
            .reduce((s, t) => s + Number(t.amount), 0) ?? 0;

        const label = isFirstDay ? "Bulanan" : "Mingguan";
        const msg =
          `📊 *Laporan ${label}*\n\n` +
          `Pemasukan: +Rp${income.toLocaleString("id-ID")}\n` +
          `Pengeluaran: -Rp${expense.toLocaleString("id-ID")}\n` +
          `Selisih: Rp${(income - expense).toLocaleString("id-ID")}\n\n` +
          `Cek detail di web: picisflow.vercel.app`;

        await bot.api.sendMessage(link.telegram_chat_id, msg, {
          parse_mode: "Markdown",
        });
      }
    }
  }

  // === 3. Goal Completion Notification ===
  const { data: completedGoals } = await supabase
    .from("savings_goals")
    .select("id, user_id, name, target_amount, current_amount")
    .eq("is_completed", false);

  if (completedGoals) {
    for (const g of completedGoals) {
      if (Number(g.current_amount) >= Number(g.target_amount)) {
        await supabase
          .from("savings_goals")
          .update({ is_completed: true })
          .eq("id", g.id);

        await supabase.from("notifications").insert({
          user_id: g.user_id,
          type: "info",
          title: `🎯 Target "${g.name}" tercapai!`,
          body: `Rp${Number(g.current_amount).toLocaleString("id-ID")} udah terkumpul!`,
          link: "/goals",
        });
      }
    }
  }

  // === 4. Reminder: inactive users >48h ===
  const twoDaysAgo = new Date(wibNow().getTime() - 48 * 60 * 60 * 1000).toISOString();

  const { data: usersToRemind } = await supabase
    .from("telegram_links")
    .select("user_id, telegram_chat_id")
    .eq("is_verified", true)
    .not("telegram_chat_id", "is", null);

  if (usersToRemind) {
    const bot = getBot();

    for (const u of usersToRemind) {
      if (!u.telegram_chat_id) continue;

      const { data: lastTx } = await supabase
        .from("transactions")
        .select("created_at")
        .eq("user_id", u.user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!lastTx || lastTx.created_at < twoDaysAgo) {
        await bot.api.sendMessage(
          u.telegram_chat_id,
          "Hai! Udah 2 hari sejak transaksi terakhir. Catat sekarang yuk? 🤗\n\n" +
          "Cukup kirim: kopi 15000\n" +
          "Atau /list buat lihat transaksi terbaru."
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
