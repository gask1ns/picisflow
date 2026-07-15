import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function verifyTelegramInitData(initData: string): Promise<{ user?: { id: number; username?: string }; ok: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false };

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const enc = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    "raw", enc.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );

  const secret = await crypto.subtle.sign("HMAC", secretKey, enc.encode(token));
  const secretKey2 = await crypto.subtle.importKey(
    "raw", secret,
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );

  const computedHashBytes = await crypto.subtle.sign("HMAC", secretKey2, enc.encode(dataCheckString));
  const computedHash = [...new Uint8Array(computedHashBytes)].map((b) => b.toString(16).padStart(2, "0")).join("");

  if (computedHash !== hash) return { ok: false };

  let user: { id: number; username?: string } | undefined;
  try { user = JSON.parse(params.get("user") ?? "null"); } catch { /* ignore */ }

  return { user, ok: true };
}

export async function POST(request: Request) {
  const { initData } = await request.json();
  if (!initData || typeof initData !== "string") {
    return NextResponse.json({ error: "Missing initData" }, { status: 400 });
  }

  const result = await verifyTelegramInitData(initData);
  if (!result.ok) {
    return NextResponse.json({ error: "Invalid initData" }, { status: 401 });
  }

  if (!result.user?.id) {
    return NextResponse.json({ error: "No user in initData" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: link } = await supabase
    .from("telegram_links")
    .select("user_id, telegram_username, is_verified")
    .eq("telegram_chat_id", result.user.id)
    .single();

  if (link?.is_verified) {
    return NextResponse.json({
      verified: true,
      user_id: link.user_id,
      telegram_username: link.telegram_username ?? result.user.username,
    });
  }

  return NextResponse.json({
    verified: false,
    telegram_id: result.user.id,
    telegram_username: result.user.username,
  });
}
