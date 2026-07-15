"use client";

import { useState } from "react";
import Link from "next/link";
import { useTelegramLink } from "@/lib/telegram/link-context";

export function TelegramLinkBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { linked } = useTelegramLink();

  if (dismissed || linked) return null;

  return (
    <div className="border-b-4 border-black bg-accent px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
      <p className="text-sm font-bold">
        📱 Hubungkan Telegram biar bisa catat dari bot!
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/settings"
          className="border-2 border-black px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-all"
        >
          Settings
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="text-lg font-bold leading-none hover:opacity-60"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
