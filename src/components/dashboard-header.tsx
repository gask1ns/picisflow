"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationCenter } from "@/components/notification-center";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transaksi",
  "/transactions/recurring": "Berulang",
  "/categories": "Kategori",
  "/goals": "Target Tabungan",
  "/debts": "Hutang / Piutang",
  "/settings": "Settings",
};

export function DashboardHeader({ email }: { email: string }) {
  const pathname = usePathname();
  const title = Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1] ?? "PicisFlow";

  return (
    <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b-4 border-black bg-card px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <h1 className="font-head text-xl font-black uppercase">{title}</h1>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationCenter />
        <div className="hidden sm:flex items-center gap-2 border-2 border-black bg-card px-3 py-1.5">
          <div className="flex size-7 items-center justify-center rounded-full border-2 border-black bg-secondary text-secondary-foreground text-xs font-black">
            {email.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium max-w-[120px] truncate">{email}</span>
        </div>
        <div className="flex sm:hidden size-9 items-center justify-center border-2 border-black bg-card">
          <span className="text-xs font-black">{email.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </header>
  );
}
