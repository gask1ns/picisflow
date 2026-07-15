"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createRecurring(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("recurring_transactions").insert({
    user_id: user.id,
    category_id: formData.get("category_id") || null,
    type: formData.get("type"),
    amount: Number(formData.get("amount")),
    description: formData.get("description") || null,
    frequency: formData.get("frequency"),
    interval_value: Number(formData.get("interval_value") ?? 1),
    day_of_month: formData.get("day_of_month") ? Number(formData.get("day_of_month")) : null,
    day_of_week: formData.get("day_of_week") ? Number(formData.get("day_of_week")) : null,
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date") || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/transactions/recurring");
}

export async function toggleRecurring(id: string, active: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("recurring_transactions")
    .update({ is_active: active })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/transactions/recurring");
}

export async function toggleRecurringAction(formData: FormData) {
  const id = formData.get("id") as string;
  const active = formData.get("active") === "true";
  await toggleRecurring(id, active);
}

export async function deleteRecurring(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/transactions/recurring");
}
