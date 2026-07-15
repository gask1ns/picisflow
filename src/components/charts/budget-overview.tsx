"use client"

import { useActionState, useState } from "react"
import { Plus } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { setMonthlyBudget } from "@/lib/categories/actions"

type CatBudget = {
  id: string
  name: string
  icon: string | null
  amount: number
  budget: number
  period: "monthly" | "weekly"
}

export function BudgetOverview({
  budgets,
  noBudget,
}: {
  budgets: CatBudget[]
  noBudget: { id: string; name: string; icon: string | null }[]
}) {
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [budgetVal, setBudgetVal] = useState("")

  const [, action, pending] = useActionState(
    async () => {
      if (!editId) return null
      await setMonthlyBudget(editId, Number(budgetVal) || null)
      setShowModal(false)
      setEditId(null)
      setBudgetVal("")
      return null
    },
    null
  )

  const totalBudget = budgets.reduce((s, b) => s + b.budget, 0)
  const totalUsed = budgets.reduce((s, b) => s + b.amount, 0)
  const pct = totalBudget > 0 ? Math.min(100, Math.round((totalUsed / totalBudget) * 100)) : 0

  return (
    <div className="border-2 border-black bg-card p-4 sm:p-6 shadow-lg flex flex-col gap-3">
      <h3 className="font-bold uppercase text-base">Ringkasan Budget</h3>

      {totalBudget > 0 && (
        <div className="border-2 border-black p-3">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span>Total Terpakai</span>
            <span className={pct >= 100 ? "text-danger" : ""}>
              Rp{totalUsed.toLocaleString("id-ID")} / Rp{totalBudget.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="h-2 border-2 border-black">
            <div
              className={`h-full transition-all duration-500 ${
                pct >= 100 ? "bg-danger" : pct >= 80 ? "bg-accent" : "bg-success"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs font-bold mt-1">
            Sisa: Rp{(totalBudget - totalUsed).toLocaleString("id-ID")}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        {budgets.map((b) => (
          <div key={b.id} className="flex items-center justify-between text-xs">
            <span className="truncate min-w-0">
              {b.icon ?? "📄"} {b.name}
            </span>
            <span className="shrink-0 font-bold">
              {Math.min(100, Math.round((b.amount / b.budget) * 100))}%
            </span>
          </div>
        ))}
      </div>

      {noBudget.length > 0 && (
        <div className="border-t-2 border-black pt-2 mt-1">
          <p className="text-xs font-bold uppercase mb-1">Belum ada budget</p>
          <div className="flex flex-col gap-1">
            {noBudget.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setEditId(c.id)
                  setBudgetVal("")
                  setShowModal(true)
                }}
                className="flex items-center gap-1 text-xs hover:bg-black/5 transition-colors text-left"
              >
                <Plus className="w-3 h-3 shrink-0" />
                <span className="truncate">{c.icon ?? "📄"} {c.name}</span>
              </button>
            ))}
            {noBudget.length > 4 && (
              <p className="text-xs">+{noBudget.length - 4} lainnya</p>
            )}
          </div>
        </div>
      )}

      {totalBudget === 0 && noBudget.length === 0 && (
        <p className="text-xs">Tidak ada kategori pengeluaran.</p>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <p className="font-bold mb-4">Set Budget</p>
        <form action={action} className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Jumlah budget (Rp)"
            min={1}
            value={budgetVal}
            onChange={(e) => setBudgetVal(e.target.value)}
            className="border-2 border-black px-4 py-3 w-full"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 border-2 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-sm hover:translate-x-[1px] transition-all disabled:opacity-50"
            >
              {pending ? "..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 border-2 border-black bg-card px-4 py-2 font-bold uppercase shadow-sm"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
