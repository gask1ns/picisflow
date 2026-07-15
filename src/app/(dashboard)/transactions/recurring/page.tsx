import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageWrapper } from "@/components/motion/page-wrapper";
import { RecurringClient } from "./client";

export default async function RecurringPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: recurring } = await supabase
    .from("recurring_transactions")
    .select("*, categories(name, icon)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, icon, type")
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order("type")
    .order("name");

  const raw = recurring?.map((r) => ({
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    description: r.description,
    frequency: r.frequency,
    interval_value: r.interval_value,
    day_of_month: r.day_of_month,
    day_of_week: r.day_of_week,
    start_date: r.start_date,
    end_date: r.end_date,
    is_active: r.is_active,
    last_generated_date: r.last_generated_date,
    categoryName: r.categories?.name ?? null,
    categoryIcon: r.categories?.icon ?? null,
  })) ?? [];

  return (
    <PageWrapper>
      <RecurringClient recurring={raw} categories={cats ?? []} />
    </PageWrapper>
  );
}
