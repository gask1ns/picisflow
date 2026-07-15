"use client";

import { useActionState } from "react";
import { login, magicLink } from "@/lib/supabase/actions";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loginState, loginAction, loginPending] = useActionState(
    (_: { error?: string } | null, fd: FormData) => login(fd),
    null
  );

  const [magicState, magicAction, magicPending] = useActionState(
    (_: { error?: string; success?: boolean } | null, fd: FormData) =>
      magicLink(fd),
    null
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#1a1a1a] w-full max-w-sm"
      >
        <h1 className="text-3xl font-black uppercase mb-2">Masuk</h1>
        <p className="text-sm mb-6">Email & password atau magic link.</p>

        <form action={loginAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="login-email" className="text-xs font-bold uppercase mb-1 block">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="Email"
              required
              className="border-4 border-black px-4 py-3 text-sm w-full"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="text-xs font-bold uppercase mb-1 block">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Password"
              required
              className="border-4 border-black px-4 py-3 text-sm w-full"
            />
          </div>
          {loginState?.error && (
            <p className="text-sm text-danger">{loginState.error}</p>
          )}
          <button
            type="submit"
            disabled={loginPending}
            className="border-4 border-black bg-primary px-6 py-3 font-bold text-white uppercase shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all disabled:opacity-50"
          >
            {loginPending ? "..." : "Masuk"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-2">
          <hr className="flex-1 border-black" />
          <span className="text-xs uppercase font-bold">atau</span>
          <hr className="flex-1 border-black" />
        </div>

        <form action={magicAction} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email untuk magic link"
            required
            className="border-4 border-black px-4 py-3 text-sm w-full"
          />
          {magicState?.success && (
            <p className="text-sm text-success">Cek email kamu untuk link masuk.</p>
          )}
          {magicState?.error && (
            <p className="text-sm text-danger">{magicState.error}</p>
          )}
          <button
            type="submit"
            disabled={magicPending}
            className="border-4 border-black bg-white px-6 py-3 font-bold text-black uppercase shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all disabled:opacity-50"
          >
            {magicPending ? "..." : "Kirim Magic Link"}
          </button>
        </form>

        <p className="mt-2 text-center text-sm">
          <a href="/forgot-password" className="font-bold underline">Lupa password?</a>
        </p>
        <p className="mt-2 text-center text-sm">
          Belum punya akun?{" "}
          <a href="/register" className="font-bold underline">Daftar</a>
        </p>
      </motion.div>
    </main>
  );
}
