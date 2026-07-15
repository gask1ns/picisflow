"use client";

import { useActionState } from "react";
import { signup } from "@/lib/supabase/actions";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(
    (_: { error?: string } | null, fd: FormData) => signup(fd),
    null
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_#000] w-full max-w-sm"
      >
        <h1 className="text-3xl font-black uppercase mb-2">Daftar</h1>
        <p className="text-sm mb-6">Buat akun baru.</p>

        <form action={action} className="flex flex-col gap-4">
          <input
            name="display_name"
            type="text"
            placeholder="Nama panggilan (opsional)"
            className="border-2 border-black px-4 py-3 text-sm w-full"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="border-2 border-black px-4 py-3 text-sm w-full"
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 6 karakter)"
            required
            minLength={6}
            className="border-2 border-black px-4 py-3 text-sm w-full"
          />
          {state?.error && (
            <p className="text-sm text-danger">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="border-2 border-black bg-primary px-6 py-3 font-bold text-white uppercase shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50"
          >
            {pending ? "..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Sudah punya akun?{" "}
          <a href="/login" className="font-bold underline">
            Masuk
          </a>
        </p>
      </motion.div>
    </main>
  );
}
