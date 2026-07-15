"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useTelegramLink } from "@/lib/telegram/link-context";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TgLinkRow = { is_verified: boolean };

export function TelegramLinkWatcher({ uid }: { uid: string }) {
  const { linked, setLinked } = useTelegramLink();
  const notified = useRef(false);

  useEffect(() => {
    if (linked || notified.current) return;

    const supabase = createClient();

    const channel = supabase
      .channel("telegram_link")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "telegram_links",
          filter: `user_id=eq.${uid}`,
        },
        (payload: RealtimePostgresChangesPayload<TgLinkRow>) => {
          const row = payload.new as TgLinkRow | null;
          if (row?.is_verified === true && !notified.current) {
            notified.current = true;
            setLinked(true);
            toast.success("✅ Akun Telegram berhasil terhubung!");
          }
        }
      )
      .subscribe();

    const id = setInterval(async () => {
      if (notified.current) { clearInterval(id); return; }
      const { data } = await supabase
        .from("telegram_links")
        .select("is_verified")
        .eq("user_id", uid)
        .maybeSingle();
      if (data?.is_verified) {
        notified.current = true;
        clearInterval(id);
        setLinked(true);
        toast.success("✅ Akun Telegram berhasil terhubung!");
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(id);
    };
  }, [uid, linked, setLinked]);

  return null;
}
