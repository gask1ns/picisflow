"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function VerifyContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const emailParam = searchParams.get("email");
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  async function resend() {
    setResending(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const email = emailParam || user?.email;
    if (email) {
      await supabase.auth.resend({ type: "signup", email });
    }
    setSent(true);
    setResending(false);
    setCooldown(30);
    const id = setInterval(() => setCooldown((c) => { if (c <= 1) { clearInterval(id); return 0; } return c - 1; }), 1000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="border-4 border-black bg-card p-8 shadow-lg max-w-md w-full text-center">
        <p className="text-4xl mb-4">📧</p>

        {reason === "unconfirmed" ? (
          <p className="text-sm font-bold text-destructive mb-2">Email kamu belum dikonfirmasi!</p>
        ) : (
          <h1 className="font-head text-2xl font-black uppercase mb-2">Cek Email Kamu</h1>
        )}

        <p className="text-sm mb-2">Kami udah kirim link konfirmasi ke:</p>
        <p className="text-sm font-bold mb-4">{emailParam || "email kamu"}</p>
        <p className="text-sm mb-6">Klik link itu buat verifikasi, baru bisa login dan hubungkan Telegram.</p>

        <button
          onClick={resend}
          disabled={resending || cooldown > 0}
          className="mb-6 border-4 border-black bg-primary px-4 py-2 font-bold text-black uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-sm disabled:opacity-50"
        >
          {resending ? "..." : cooldown > 0 ? `Kirim Ulang (${cooldown}s)` : sent ? "✅ Terkirim!" : "Kirim Ulang Email"}
        </button>

        <p className="text-xs text-muted-foreground mb-6">Gak terima email? Cek folder spam, atau coba daftar ulang.</p>

        <Link href="/login" className="inline-block border-4 border-black bg-card px-6 py-3 font-bold uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-sm">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background px-4"><p className="text-sm">Loading...</p></div>}>
      <VerifyContent />
    </Suspense>
  );
}
