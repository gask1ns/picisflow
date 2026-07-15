"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/motion/page-wrapper";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { FadeIn } from "@/components/motion/fade-in";
import { HoverCard } from "@/components/motion/hover-card";
import { BarChart } from "@/components/charts/bar-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { BudgetOverview } from "@/components/charts/budget-overview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Tx = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  date: string;
  categories: { name: string; icon: string | null } | null;
};

type DailyData = { date: string; income: number; expense: number };
type CatBudget = {
  id: string;
  name: string;
  icon: string | null;
  amount: number;
  budget: number;
  period: "monthly" | "weekly";
};

export function DashboardClient({
  userEmail,
  displayName,
  income,
  expense,
  balance,
  expenseByCat,
  recentTx,
  dailyData,
  budgetCats,
  noBudgetCats,
}: {
  userEmail: string;
  displayName: string | null;
  income: number;
  expense: number;
  balance: number;
  expenseByCat: { label: string; icon: string | null; amount: number; color: string; budget: number | null; period: string | null }[];
  recentTx: Tx[];
  dailyData: DailyData[];
  budgetCats: CatBudget[];
  noBudgetCats: { id: string; name: string; icon: string | null }[];
}) {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase">Dashboard</h2>
            <p className="text-sm mt-1">
              Halo, <span className="font-bold">{displayName || userEmail}</span>
            </p>
          </div>
        </div>

        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StaggerItem>
            <HoverCard>
              <StatCard label="Saldo" value={balance} color="bg-card" />
            </HoverCard>
          </StaggerItem>
          <StaggerItem>
            <HoverCard>
              <StatCard label="Pemasukan" value={income} color="bg-success text-white" />
            </HoverCard>
          </StaggerItem>
          <StaggerItem>
            <HoverCard>
              <StatCard label="Pengeluaran" value={expense} color="bg-danger text-white" />
            </HoverCard>
          </StaggerItem>
        </Stagger>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <FadeIn delay={0.2}>
              <TrendChart data={dailyData} />
            </FadeIn>
          </div>
          <div>
            <FadeIn delay={0.25}>
              <BudgetOverview budgets={budgetCats} noBudget={noBudgetCats} />
            </FadeIn>
          </div>
        </div>

        <FadeIn delay={0.3}>
          <HoverCard>
            <div className="border-2 border-black bg-card p-4 sm:p-6 shadow-lg">
              <h3 className="font-bold uppercase mb-4 text-base">
                Breakdown Pengeluaran per Kategori
              </h3>
              <BarChart items={expenseByCat} />
            </div>
          </HoverCard>
        </FadeIn>

        {budgetCats.length > 0 && (
          <FadeIn delay={0.35}>
            <div className="border-2 border-black bg-card p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold uppercase text-base">Budget Kamu</h3>
                <span className="text-xs font-bold">{budgetCats.length} budget aktif</span>
              </div>
              <Stagger className="flex flex-col gap-3">
                {budgetCats.map((b) => {
                  const pct = b.budget > 0 ? Math.min(100, Math.round((b.amount / b.budget) * 100)) : 0;
                  const barColor =
                    pct >= 100 ? "bg-danger" : pct >= 80 ? "bg-accent" : "bg-success";
                  return (
                    <StaggerItem key={b.id}>
                      <motion.div
                        animate={pct >= 85 ? {
                          x: [0, -4, 4, -4, 4, -2, 2, 0],
                        } : { x: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>{b.icon ?? "📄"} {b.name}</span>
                          <span className={pct >= 100 ? "text-danger" : pct >= 85 ? "text-accent" : ""}>
                            Rp{b.amount.toLocaleString("id-ID")} / Rp{b.budget.toLocaleString("id-ID")} ({pct}%)
                            {b.period === "weekly" && <span className="text-[10px] ml-1">/mg</span>}
                          </span>
                        </div>
                        <div className={`h-3 border-2 border-black ${pct >= 85 ? "border-danger" : "bg-card"}`}>
                          <div
                            className={`h-full ${barColor} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>
          </FadeIn>
        )}

        {budgetCats.length === 0 && (
          <FadeIn delay={0.35}>
            <div className="border-2 border-black border-dashed bg-card p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col items-center gap-2 py-4">
                <p className="text-sm font-bold uppercase">Belum ada budget</p>
                <p className="text-xs text-center max-w-xs">
                  Set budget per kategori biar bisa pantau batas pengeluaran kamu.
                </p>
                <Link
                  href="/categories"
                  className="border-2 border-black bg-primary px-4 py-2 text-sm font-bold uppercase shadow-sm hover:translate-x-[1px] transition-all"
                >
                  Set Budget
                </Link>
              </div>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.4}>
          <div className="border-2 border-black bg-card shadow-lg">
            <div className="flex items-center justify-between p-4 sm:p-6 pb-0">
              <h3 className="font-bold uppercase text-base">Transaksi Terbaru</h3>
              <Link href="/transactions" className="text-xs font-bold underline">
                Lihat Semua
              </Link>
            </div>

            {!recentTx.length && (
              <p className="text-sm py-8 text-center">Belum ada transaksi. Mulai catat!</p>
            )}

            {recentTx.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTx.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Link href={`/transactions/${t.id}`} className="flex items-center gap-1.5">
                          <span className="flex size-10 shrink-0 items-center justify-center border-2 border-black bg-muted text-lg">{t.categories?.icon ?? "📄"}</span>
                          <span className="font-bold truncate max-w-[120px]">
                            {t.categories?.name ?? "Tanpa kategori"}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/transactions/${t.id}`} className="text-xs truncate block max-w-[150px]">
                          {t.description || "-"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/transactions/${t.id}`}>
                          <span className={`font-black tabular-nums text-xs ${
                            t.type === "income" ? "text-success" : "text-danger"
                          }`}>
                            {t.type === "income" ? "+" : "-"}Rp{t.amount.toLocaleString("id-ID")}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/transactions/${t.id}`} className="text-xs">
                          {new Date(t.date).toLocaleDateString("id-ID")}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </FadeIn>

      </div>
    </PageWrapper>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`border-2 border-black ${color} p-4 sm:p-6 shadow-lg`}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black">
        Rp{value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}
