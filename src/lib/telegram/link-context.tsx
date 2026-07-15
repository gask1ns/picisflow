"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

type LinkContext = {
  linked: boolean;
  setLinked: (v: boolean) => void;
};

const Ctx = createContext<LinkContext>({ linked: false, setLinked: () => {} });

export function TelegramLinkProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("telegram_links")
      .select("is_verified")
      .eq("user_id", uid)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.is_verified) setLinked(true);
      });
  }, [uid]);

  return <Ctx.Provider value={{ linked, setLinked }}>{children}</Ctx.Provider>;
}

export function useTelegramLink() {
  return useContext(Ctx);
}
