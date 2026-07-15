import { createServiceClient } from "@/lib/supabase/server";

export type PendingSession = {
  chat_id: number;
  user_id: string;
  category_id: string | null;
  step: string;
  edit_tx_id?: string;
  goal_id?: string;
};

export async function getSession(chatId: number): Promise<PendingSession | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("pending_sessions")
    .select("*")
    .eq("chat_id", chatId)
    .single();
  return data;
}

export async function setSession(chatId: number, session: Partial<PendingSession>) {
  const supabase = createServiceClient();
  await supabase.from("pending_sessions").upsert(
    { chat_id: chatId, ...session },
    { onConflict: "chat_id" }
  );
}

export async function clearSession(chatId: number) {
  const supabase = createServiceClient();
  await supabase.from("pending_sessions").delete().eq("chat_id", chatId);
}
