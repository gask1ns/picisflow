"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const chatMessages = [
  { tag: "user", text: "Kopi 15000" },
  { tag: "bot", text: "✅ Tersimpan!\n📂 Makanan & Minuman\n📝 Kopi" },
  { tag: "user", text: "Gaji 5000000" },
  { tag: "bot", text: "💰 Pemasukan tercatat" },
];

export default function LandingPage() {
  return (
    <main>
      <nav className="fixed top-0 inset-x-0 z-50 border-b-2 border-black bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-black uppercase">PicisFlow</span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="border-2 border-black px-4 py-1.5 text-xs font-bold uppercase transition-all hover:bg-secondary hover:text-secondary-foreground sm:text-sm"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="border-2 border-black bg-primary px-4 py-1.5 text-xs font-bold uppercase text-white transition-all hover:bg-primary-hover sm:text-sm"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      <section className="flex min-h-screen items-center px-4 pt-24 pb-16 sm:pt-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2"
        >
          <motion.div variants={item} className="flex flex-col gap-6">
            <h1 className="text-5xl font-black uppercase leading-[0.9] sm:text-7xl lg:text-8xl">
              Catat
              <br />
              <span className="text-primary">Recehan</span>
              <br />
              Pantau
              <br />
              <span className="text-secondary">Keuangan</span>
            </h1>
            <p className="max-w-md text-base sm:text-lg">
              Catat transaksi via Telegram, pantau pengeluaran di dashboard
              realtime. Gratis, cepat, ga pake ribet.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="border-2 border-black bg-primary px-8 py-3 font-bold uppercase text-white shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000]"
              >
                Mulai Gratis
              </Link>
              <Link
                href="/login"
                className="border-2 border-black bg-card px-8 py-3 font-bold uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000]"
              >
                Masuk
              </Link>
            </div>
            <div className="flex w-fit items-center gap-2 border-2 border-black bg-accent px-4 py-2">
              <span className="text-sm font-bold">🤖 Juga di Telegram</span>
              <span className="hidden text-xs sm:inline">
                — /catat kopi 15000
              </span>
            </div>
          </motion.div>

          <motion.div variants={item} className="hidden lg:block">
            <div className="border-2 border-black bg-card p-4 shadow-[6px_6px_0_0_#000] sm:p-6">
              <div className="mb-3 flex items-center gap-2 border-b-2 border-black pb-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-black text-white">
                  P
                </div>
                <div>
                  <p className="text-xs font-bold">PicisFlow Bot</p>
                  <p className="text-[10px] opacity-60">Online</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.tag === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] border-2 border-black px-3 py-2 text-sm whitespace-pre-line ${
                        m.tag === "user" ? "bg-primary text-white" : "bg-muted"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="border-t-2 border-black bg-primary px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.h2
              variants={item}
              className="mb-12 text-center text-3xl font-black uppercase text-white sm:text-4xl"
            >
              Kenapa PicisFlow?
            </motion.h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { icon: "🤖", title: "Telegram Bot", desc: "Catat transaksi tanpa buka app. Kirim 'kopi 15000' auto-detect kategori." },
                { icon: "📊", title: "Dashboard", desc: "Pantau pemasukan, pengeluaran, budget, grafik tren harian." },
                { icon: "🎯", title: "Target & Budget", desc: "Set budget per kategori, target tabungan, catat hutang/piutang." },
              ].map((f, i) => (
                <motion.div key={i} variants={item}>
                  <div className="border-2 border-black bg-card p-6 shadow-[4px_4px_0_0_#000]">
                    <span className="text-3xl">{f.icon}</span>
                    <h3 className="mt-2 font-black uppercase">{f.title}</h3>
                    <p className="mt-1 text-sm">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t-2 border-black px-4 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.h2
              variants={item}
              className="mb-12 text-3xl font-black uppercase sm:text-4xl"
            >
              Cara Pake
            </motion.h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { num: "01", color: "text-primary", title: "Daftar", desc: "Buat akun gratis pake email." },
                { num: "02", color: "text-secondary", title: "Link Telegram", desc: "Hubungin akun ke bot Telegram." },
                { num: "03", color: "text-accent", title: "Catat", desc: "Tinggal kirim 'kopi 15000' ke bot." },
              ].map((s, i) => (
                <motion.div key={i} variants={item}>
                  <span className={`text-6xl font-black ${s.color}`}>
                    {s.num}
                  </span>
                  <h3 className="mt-2 font-black uppercase">{s.title}</h3>
                  <p className="mt-1 text-sm">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t-2 border-black bg-foreground px-4 py-6 text-center text-sm font-bold text-background">
        PicisFlow &copy; {new Date().getFullYear()} &mdash; by gask1ns
      </footer>
    </main>
  );
}
