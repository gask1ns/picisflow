import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DebtsClient } from "./client";

export default async function DebtsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: debts } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <DebtsClient debts={debts ?? []} />;
}
