import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const { data: tx } = await supabase
    .from("transactions")
    .select("type, amount, categories(id, name, icon, color), category_id, date")
    .eq("user_id", user.id)
    .gte("date", firstDay)
    .returns<Array<{
      type: string;
      amount: number;
      category_id: string | null;
      categories: { name: string; icon: string | null; color: string | null } | null;
      date: string;
    }>>();

  const income =
    tx?.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const expense =
    tx?.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const balance = income - expense;

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, icon, color, type, monthly_budget")
    .or(`user_id.eq.${user.id},user_id.is.null`);

  const expenseByCat =
    tx
      ?.filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          const name = t.categories?.name ?? "Tanpa kategori";
          const existing = acc.find((a) => a.label === name);
          if (existing) existing.amount += Number(t.amount);
          else
            acc.push({
              label: name,
              icon: t.categories?.icon ?? null,
              amount: Number(t.amount),
              color: t.categories?.color ?? "#6b7280",
            });
          return acc;
        },
        [] as { label: string; icon: string | null; amount: number; color: string }[]
      )
      .sort((a, b) => b.amount - a.amount) ?? [];

  const expenseWithBudget = expenseByCat.map((e) => {
    const cat = cats?.find((c) => c.name === e.label && c.monthly_budget);
    return {
      ...e,
      budget: cat?.monthly_budget ? Number(cat.monthly_budget) : null,
      period: ((cat as Record<string, unknown> | null)?.budget_period as "monthly" | "weekly" | null) ?? null,
    };
  });

  const { data: recentTx } = await supabase
    .from("transactions")
    .select("id, type, amount, description, date, categories(name, icon)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<Array<{
      id: string;
      type: string;
      amount: number;
      description: string | null;
      date: string;
      categories: { name: string; icon: string | null } | null;
    }>>();

  const dailyData =
    tx?.reduce(
      (acc, t) => {
        const day = t.date;
        let entry = acc.find((e) => e.date === day);
        if (!entry) {
          entry = { date: day, income: 0, expense: 0 };
          acc.push(entry);
        }
        if (t.type === "income") entry.income += Number(t.amount);
        else entry.expense += Number(t.amount);
        return acc;
      },
      [] as { date: string; income: number; expense: number }[]
    ) ?? [];

  const budgetCats = (cats?.filter((c) => c.monthly_budget) ?? []).map((c) => {
    const spent = expenseByCat.find((e) => e.label === c.name)?.amount ?? 0;
    return {
      id: c.id,
      name: c.name,
      icon: c.icon,
      amount: spent,
      budget: Number(c.monthly_budget),
      period: ((c as Record<string, unknown>).budget_period ?? "monthly") as "monthly" | "weekly",
    };
  });

  const noBudgetCats = (cats?.filter((c) => c.type === "expense" && !c.monthly_budget) ?? []).map(
    (c) => ({ id: c.id, name: c.name, icon: c.icon })
  );

  return (
    <DashboardClient
      userEmail={user.email ?? ""}
      displayName={profile?.display_name ?? null}
      income={income}
      expense={expense}
      balance={balance}
      expenseByCat={expenseWithBudget}
      recentTx={recentTx ?? []}
      dailyData={dailyData}
      budgetCats={budgetCats}
      noBudgetCats={noBudgetCats}
    />
  );
}
