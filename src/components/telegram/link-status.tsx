"use client";

import { useActionState, useState } from "react";
import { generateTelegramLink, unlinkTelegram } from "@/lib/telegram/actions";

type Link = {
  is_verified: boolean;
  telegram_username: string | null;
  telegram_chat_id: number | null;
  verification_code: string | null;
  verification_code_expires_at: string | null;
} | null;

export function TelegramLink({ link }: { link: Link }) {
  const [copied, setCopied] = useState(false);
  const [genState, genAction, genPending] = useActionState(
    async (prev: { code?: string; error?: string; expires_at?: string } | null) => {
      const result = await generateTelegramLink();
      return result ?? null;
    },
    null
  );

  const [unlinkState, unlinkAction, unlinkPending] = useActionState(
    async (prev: { error?: string } | null) => {
      const result = await unlinkTelegram();
      if (result) return result;
      return { error: undefined };
    },
    null
  );

  if (link?.is_verified) {
    return (
      <div className="border-2 border-black bg-card p-6 shadow-lg">
        <h3 className="font-bold uppercase mb-4">Telegram</h3>
        <p className="text-sm mb-4">
          ✅ Terhubung ke{" "}
          {link.telegram_username
            ? "@" + link.telegram_username
            : "chat_id: " + link.telegram_chat_id}
        </p>
        <form action={unlinkAction}>
          <button
            type="submit"
            disabled={unlinkPending}
            className="border-2 border-black bg-danger px-4 py-2 text-sm font-bold text-white uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-xs transition-all disabled:opacity-50"
          >
            {unlinkPending ? "..." : "Putuskan"}
          </button>
        </form>
        {unlinkState?.error && (
          <p className="text-sm text-danger mt-2">{unlinkState.error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="border-2 border-black bg-card p-6 shadow-lg">
      <h3 className="font-bold uppercase mb-4">Telegram</h3>
      <p className="text-sm mb-4">Belum terhubung ke Telegram.</p>

      <form action={genAction}>
        <button
          type="submit"
          disabled={genPending}
          className="border-2 border-black bg-primary px-4 py-2 text-sm font-bold text-white uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-xs transition-all disabled:opacity-50"
        >
          {genPending ? "..." : "Hubungkan Telegram"}
        </button>
      </form>

      {genState?.code && (
        <div className="mt-4 border-2 border-black bg-accent p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold uppercase">Kode verifikasi:</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(genState.code!);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="border-2 border-black px-2 py-0.5 text-xs font-bold hover:bg-black hover:text-white transition-all"
            >
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
          </div>
          <p className="text-2xl font-black tracking-widest">{genState.code}</p>
          <p className="text-xs mt-1">
            Kirim ke bot Telegram: <span className="font-bold">/start {genState.code}</span>
          </p>
          <p className="text-xs">Berlaku 15 menit.</p>
        </div>
      )}

      {genState?.error && (
        <p className="text-sm text-danger mt-2">{genState.error}</p>
      )}
    </div>
  );
}
