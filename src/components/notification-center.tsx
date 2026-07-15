"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

type Notif = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
};

const icons: Record<string, string> = {
  budget_alert: "⚠️",
  recurring_generated: "🔄",
  debt_due: "📅",
  info: "ℹ️",
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const r = await fetch("/api/notifications");
      const d = await r.json();
      if (d.notifications) setNotifs(d.notifications);
      if (typeof d.unread === "number") setUnread(d.unread);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  useEffect(() => {
    if (!open) return;
    fetchNotifs();
  }, [open, fetchNotifs]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex size-9 items-center justify-center border-2 border-black bg-card hover:bg-accent transition-colors"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border-2 border-black bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 border-4 border-black bg-card shadow-lg z-50">
          <div className="flex items-center justify-between border-b-4 border-black px-4 py-3">
            <span className="font-head text-sm font-black uppercase">Notifikasi</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-bold underline hover:text-muted-foreground"
              >
                Tandai Dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!notifs.length && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Belum ada notifikasi.
              </p>
            )}

            {notifs.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 border-b-2 border-black px-4 py-3 cursor-pointer hover:bg-accent transition-colors ${!n.is_read ? "font-bold" : ""}`}
                onClick={() => markRead(n.id)}
              >
                <span className="text-lg shrink-0">{icons[n.type] ?? "ℹ️"}</span>
                <div className="min-w-0">
                  <p className={`text-sm ${n.is_read ? "font-medium" : "font-bold"}`}>{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(n.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
