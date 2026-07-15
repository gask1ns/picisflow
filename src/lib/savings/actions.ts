"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("savings_goals").insert({
    user_id: user.id,
    name: formData.get("name"),
    target_amount: Number(formData.get("target_amount")),
    deadline: formData.get("deadline") || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/goals");
}

export async function updateGoalProgress(id: string, amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: goal } = await supabase
    .from("savings_goals")
    .select("current_amount")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!goal) return { error: "Goal not found" };

  const newAmount = Math.min(
    Number(goal.current_amount) + amount,
    // We don't have target_amount here directly, but the constraint handles it
    Infinity
  );

  const { error } = await supabase
    .from("savings_goals")
    .update({ current_amount: newAmount })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/goals");
}

export async function updateGoal(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("savings_goals")
    .update({
      name: formData.get("name"),
      target_amount: Number(formData.get("target_amount")),
      deadline: formData.get("deadline") || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/goals");
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/goals");
}

export async function toggleGoalComplete(id: string, completed: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("savings_goals")
    .update({
      is_completed: completed,
      current_amount: completed ? undefined : 0,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/goals");
}
