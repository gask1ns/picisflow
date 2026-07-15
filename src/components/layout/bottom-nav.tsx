"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, User } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/goals", label: "Target", icon: PiggyBank },
  { href: "/settings", label: "Akun", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  const activeIdx = items.findIndex(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <nav className="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-md sm:hidden">
      <div className="relative rounded-2xl border-2 border-black bg-card shadow-lg px-2 py-1.5">
        <div className="flex items-center">
          {items.map((item, i) => {
            const active = i === activeIdx;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 px-1 text-[10px] font-bold uppercase transition-colors flex-1 rounded-xl ${
                  active ? "text-primary-foreground" : "text-foreground hover:text-primary"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 bg-primary rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className="size-5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}