"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Repeat,
  Tags,
  PiggyBank,
  HandCoins,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/supabase/actions";
import { useTelegramLink } from "@/lib/telegram/link-context";
import { Shield } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/transactions/recurring", label: "Berulang", icon: Repeat },
  { href: "/categories", label: "Kategori", icon: Tags },
  { href: "/goals", label: "Target", icon: PiggyBank },
  { href: "/debts", label: "Hutang", icon: HandCoins },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { linked } = useTelegramLink();

  return (
    <Sidebar>
      <SidebarHeader className="h-[72px] border-b-4 border-black flex-row items-center gap-3 px-4">
        <div className="flex size-10 items-center justify-center border-3 border-black bg-primary">
          <span className="font-head text-xl font-black">P</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-head text-lg font-black uppercase tracking-tight">PicisFlow</span>
          <span className="text-xs text-muted-foreground">Catat &amp; Pantau</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={active} render={<Link href={item.href} />} className={active ? "border-2 border-black shadow-md py-5 px-4 font-black text-base rounded-none" : "py-2 rounded-none"}>
                      <item.icon />
                      <span className="flex-1">{item.label}</span>
                      {item.href === "/settings" && !linked && (
                        <span className="size-2 rounded-full bg-destructive shrink-0" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={pathname.startsWith("/admin")} render={<Link href="/admin" />} className={pathname.startsWith("/admin") ? "border-2 border-black shadow-md py-5 px-4 font-black text-base rounded-none" : "py-2 rounded-none"}>
                    <Shield />
                    <span className="flex-1">Admin</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="border-t-4 border-black p-4">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 border-2 border-black px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
