"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageWrapper } from "@/components/motion/page-wrapper";
import { FadeIn } from "@/components/motion/fade-in";
export function AdminClient() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendTelegram, setSendTelegram] = useState(false);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ users: 0, linked: 0, transactions: 0 });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.users === "number") setStats(d);
      })
      .catch(() => {});
  }, []);

  async function broadcast(toAll: boolean) {
    setSending(true);
    try {
      const r = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, sendTelegram, toAll }),
      });
      const d = await r.json();
      if (d.ok) {
        toast.success(toAll ? "Broadcast terkirim!" : "Test terkirim!");
        if (toAll) { setTitle(""); setBody(""); }
      } else {
        toast.error(d.error ?? "Gagal");
      }
    } catch {
      toast.error("Gagal kirim");
    }
    setSending(false);
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-6">
        <h2 className="text-3xl font-black uppercase">🛠️ Admin Panel</h2>

        <FadeIn>
          <div className="grid grid-cols-3 gap-4">
            <div className="border-4 border-black bg-card p-4 shadow-md">
              <p className="text-xs font-bold uppercase">User</p>
              <p className="text-2xl font-black">{stats.users}</p>
            </div>
            <div className="border-4 border-black bg-card p-4 shadow-md">
              <p className="text-xs font-bold uppercase">Telegram</p>
              <p className="text-2xl font-black">{stats.linked}</p>
            </div>
            <div className="border-4 border-black bg-card p-4 shadow-md">
              <p className="text-xs font-bold uppercase">Transaksi</p>
              <p className="text-2xl font-black">{stats.transactions}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="border-4 border-black bg-card p-6 shadow-lg">
            <h3 className="font-bold uppercase mb-4">📢 Broadcast Notification</h3>
            <div className="flex flex-col gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul notifikasi"
                className="border-4 border-black px-4 py-3 w-full"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Isi notifikasi (opsional)"
                rows={3}
                className="border-4 border-black px-4 py-3 w-full resize-none"
              />
              <label className="flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={sendTelegram}
                  onChange={(e) => setSendTelegram(e.target.checked)}
                  className="size-4"
                />
                Kirim juga ke Telegram
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => broadcast(true)}
                  disabled={sending || !title}
                  className="flex-1 border-4 border-black bg-primary px-4 py-2 font-bold text-black uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50"
                >
                  {sending ? "..." : "Kirim ke Semua User"}
                </button>
                <button
                  onClick={() => broadcast(false)}
                  disabled={sending || !title}
                  className="border-4 border-black bg-card px-4 py-2 font-bold uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50"
                >
                  Test
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageWrapper>
  );
}
