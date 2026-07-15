"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateTelegramLink() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const code = crypto.randomUUID().slice(0, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error } = await supabase.from("telegram_links").upsert(
    {
      user_id: user.id,
      verification_code: code,
      verification_code_expires_at: expiresAt,
      is_verified: false,
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { code, expires_at: expiresAt };
}

export async function unlinkTelegram() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { error } = await supabase
    .from("telegram_links")
    .update({
      telegram_chat_id: null,
      telegram_username: null,
      is_verified: false,
      verification_code: null,
      verification_code_expires_at: null,
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
}
