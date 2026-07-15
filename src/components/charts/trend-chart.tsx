"use client"

import { useState, useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type DailyData = { date: string; income: number; expense: number }

const chartConfig = {
  income: {
    label: "Pemasukan",
    color: "var(--color-success)",
  },
  expense: {
    label: "Pengeluaran",
    color: "var(--color-danger)",
  },
} satisfies ChartConfig

function fillGaps(data: DailyData[], range: "7d" | "30d" | "all"): DailyData[] {
  const now = new Date()
  let start = new Date(now)
  if (range === "7d") {
    start.setDate(now.getDate() - 6)
  } else if (range === "30d") {
    start.setDate(now.getDate() - 29)
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const map = new Map(data.map((d) => [d.date, d]))
  const result: DailyData[] = []
  const end = new Date(now)
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toLocaleDateString("en-CA")
    result.push(map.get(key) ?? { date: key, income: 0, expense: 0 })
  }
  return result
}

export function TrendChart({ data }: { data: DailyData[] }) {
  const [range, setRange] = useState<"7d" | "30d" | "all">("all")

  const filtered = useMemo(() => fillGaps(data, range), [data, range])

  return (
    <div className="border-4 border-black bg-card p-4 sm:p-6 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold uppercase text-sm">Tren Harian</h3>
        <div className="flex gap-1">
          {(["7d", "30d", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "border-2 border-black px-2 py-0.5 text-xs font-bold uppercase transition-all",
                range === r ? "bg-primary text-white" : "bg-card"
              )}
            >
              {r === "7d" ? "7H" : r === "30d" ? "30H" : "Bln"}
            </button>
          ))}
        </div>
      </div>
      <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
        <BarChart data={filtered} barGap={0} barCategoryGap={4} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-black/20" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(v: string) => {
              const d = new Date(v + "T00:00:00")
              return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
            }}
            className="text-[10px]"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={48}
            tickFormatter={(v: number) =>
              v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` :
              v >= 1_000 ? `${(v / 1_000).toFixed(0)}rb` : `${v}`
            }
            className="text-[10px]"
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                className="shadow-none rounded-none border-4 border-black"
                labelFormatter={(value: string) => {
                  const d = new Date(value + "T00:00:00")
                  return d.toLocaleDateString("id-ID", {
                    weekday: "long", day: "numeric", month: "long",
                  })
                }}
                indicator="dot"
                formatter={(value, name) => (
                  <div className="flex w-full justify-between gap-4 font-bold">
                    <span>{name === "income" ? "Pemasukan" : "Pengeluaran"}</span>
                    <span>Rp{typeof value === "number" ? value.toLocaleString("id-ID") : value}</span>
                  </div>
                )}
              />
            }
          />
          <Bar
            dataKey="income"
            fill="var(--color-income)"
            radius={[2, 2, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="expense"
            fill="var(--color-expense)"
            radius={[2, 2, 0, 0]}
            maxBarSize={32}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}