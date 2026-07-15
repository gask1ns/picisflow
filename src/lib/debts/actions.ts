"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createDebt(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("debts").insert({
    user_id: user.id,
    counterparty_name: formData.get("counterparty_name"),
    type: formData.get("type"),
    amount: Number(formData.get("amount")),
    description: formData.get("description") || null,
    due_date: formData.get("due_date") || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/debts");
}

export async function updateDebt(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("debts")
    .update({
      counterparty_name: formData.get("counterparty_name"),
      type: formData.get("type"),
      amount: Number(formData.get("amount")),
      description: formData.get("description") || null,
      due_date: formData.get("due_date") || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/debts");
}

export async function toggleDebtPaid(id: string, paid: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("debts")
    .update({ is_paid: paid })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/debts");
}

export async function deleteDebt(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("debts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/debts");
}
