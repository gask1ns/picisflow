import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const supabase = await createClient();

  // Handle PKCE code exchange (OAuth, magic link)
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Handle email confirmation (token_hash)
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "email" | "sms" | "recovery" | "invite" | "magiclink",
    });
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard?confirmed=true`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
