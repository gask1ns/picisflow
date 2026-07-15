"use client";

import { useActionState, useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { Modal } from "@/components/ui/modal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { setMonthlyBudget } from "@/lib/categories/actions";

type Cat = {
  id: string;
  name: string;
  type: string;
  icon: string | null;
  color: string | null;
  user_id: string | null;
  monthly_budget: number | null;
  budget_period: string | null;
};

const typeLabels: Record<string, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
};

export function CategoriesClient({ categories }: { categories: Cat[] }) {
  const [editId, setEditId] = useState<string | null>(null);
  const [budget, setBudget] = useState("");
  const [period, setPeriod] = useState<"monthly" | "weekly">("monthly");

  const [state, action, pending] = useActionState(
    async (prev: { error?: string } | null) => {
      if (!editId) return null;
      const val = budget ? Number(budget) : null;
      const result = await setMonthlyBudget(editId, val, period);
      if (result?.error) {
        return result;
      }
      setEditId(null);
      setBudget("");
      setPeriod("monthly");
      return null;
    },
    null
  );

  function openBudget(cat: Cat) {
    setEditId(cat.id);
    setBudget(cat.monthly_budget?.toString() ?? "");
    setPeriod((cat.budget_period as "monthly" | "weekly") ?? "monthly");
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl font-black uppercase">Kategori</h2>

      {(["expense", "income"] as const).map((type) => (
        <div key={type}>
          <FadeIn>
            <h3 className="text-sm font-bold uppercase mb-2">{typeLabels[type]}</h3>
          </FadeIn>
          <Stagger className="flex flex-col gap-2">
            {categories
              .filter((c) => c.type === type)
              .map((c) => (
                <StaggerItem key={c.id}>
                  <div className="border-4 border-black bg-card p-4 shadow-md">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{c.icon ?? "📄"}</span>
                        <span className="font-bold text-sm truncate">{c.name}</span>
                      </div>
                      {type === "expense" && (
                        <button
                          onClick={() => openBudget(c)}
                          className="border-2 border-black bg-card px-2 py-1 text-[10px] font-bold uppercase shadow-sm hover:translate-x-[1px] transition-all shrink-0"
                        >
                          {c.monthly_budget ? "Edit" : "+ Budget"}
                        </button>
                      )}
                    </div>
                    {type === "expense" && (
                      <div className="mt-1 text-[11px] font-bold">
                        {c.monthly_budget ? (
                          <span>
                            Budget: Rp{Number(c.monthly_budget).toLocaleString("id-ID")}
                            /{c.budget_period === "weekly" ? "minggu" : "bulan"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Belum ada budget</span>
                        )}
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
          </Stagger>
        </div>
      ))}

      <Modal open={!!editId} onClose={() => setEditId(null)}>
        <p className="font-bold mb-4">Set Budget</p>
        <form action={action} className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Jumlah budget (Rp)"
            min={1}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="border-4 border-black px-4 py-3 w-full"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              className={`flex-1 border-4 border-black px-3 py-2 text-xs font-bold uppercase transition-all ${
                period === "monthly" ? "bg-primary text-white" : "bg-card"
              }`}
            >
              Bulanan
            </button>
            <button
              type="button"
              onClick={() => setPeriod("weekly")}
              className={`flex-1 border-4 border-black px-3 py-2 text-xs font-bold uppercase transition-all ${
                period === "weekly" ? "bg-primary text-white" : "bg-card"
              }`}
            >
              Mingguan
            </button>
          </div>
          {state?.error && <p className="text-xs text-danger">{state.error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 border-4 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-sm hover:translate-x-[1px] transition-all disabled:opacity-50"
            >
              {pending ? "..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => setEditId(null)}
              className="flex-1 border-4 border-black bg-card px-4 py-2 font-bold uppercase shadow-sm"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
