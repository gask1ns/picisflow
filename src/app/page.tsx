"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="border-4 border-black bg-white px-8 py-12 shadow-[8px_8px_0px_0px_#1a1a1a] max-w-lg w-full text-center"
      >
        <h1 className="text-5xl font-black uppercase tracking-tight mb-2">
          PicisFlow
        </h1>
        <p className="text-lg mb-8">
          Catat recehan, pantau keuangan.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="border-4 border-black bg-primary px-6 py-3 text-center font-bold text-white uppercase shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="border-4 border-black bg-white px-6 py-3 text-center font-bold text-black uppercase shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all"
          >
            Daftar
          </Link>
        </div>

        <p className="mt-8 text-sm">
          Juga tersedia di Telegram — catat transaksi tanpa buka app.
        </p>
      </motion.div>
    </main>
  );
}
