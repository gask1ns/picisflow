import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const service = createServiceClient();
  const { count: users } = await service
    .from("profiles")
    .select("*", { count: "exact", head: true });
  const { count: linked } = await service
    .from("telegram_links")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", true);
  const { count: transactions } = await service
    .from("transactions")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ users: users ?? 0, linked: linked ?? 0, transactions: transactions ?? 0 });
}
