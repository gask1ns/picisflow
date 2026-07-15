"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setMonthlyBudget(
  categoryId: string,
  budget: number | null,
  period: "monthly" | "weekly" = "monthly"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("categories")
    .update({ monthly_budget: budget, budget_period: budget === null ? "monthly" : period } as never)
    .eq("id", categoryId)
    .or(`user_id.eq.${user.id},user_id.is.null`);

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/dashboard");
}
