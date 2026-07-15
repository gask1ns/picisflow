import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageWrapper } from "@/components/motion/page-wrapper";
import { GoalsClient } from "./client";

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: goals } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <PageWrapper>
      <GoalsClient goals={goals ?? []} />
    </PageWrapper>
  );
}
