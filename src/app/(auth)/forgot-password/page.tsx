"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    if (err) setError(err.message);
    else setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="border-4 border-black bg-card p-8 shadow-lg max-w-sm w-full">
        <h1 className="font-head text-2xl font-black uppercase mb-2">Lupa Password</h1>
        <p className="text-sm mb-6">Masukin email, kami kirim link reset.</p>

        {sent ? (
          <p className="text-sm font-bold text-success">Cek email kamu untuk link reset password.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="text-xs font-bold uppercase mb-1 block">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-4 border-black px-4 py-3 text-sm w-full"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button type="submit" className="border-4 border-black bg-primary px-6 py-3 font-bold text-black uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
              Kirim Link Reset
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-bold underline">Kembali ke Login</Link>
        </p>
      </div>
    </div>
  );
}
