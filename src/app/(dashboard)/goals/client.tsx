"use client";

import { useActionState, useState } from "react";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { FadeIn } from "@/components/motion/fade-in";
import { HoverCard } from "@/components/motion/hover-card";
import { Modal } from "@/components/ui/modal";
import { createGoal, updateGoal, deleteGoal, toggleGoalComplete, updateGoalProgress } from "@/lib/savings/actions";

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  is_completed: boolean;
};

export function GoalsClient({ goals }: { goals: Goal[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [topUpId, setTopUpId] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");

  const [createState, createAction, createPending] = useActionState(
    async (prev: { error?: string } | null, fd: FormData) => {
      const r = await createGoal(fd);
      if (!r?.error) setShowForm(false);
      return r ?? null;
    },
    null
  );

  const [editState, editAction, editPending] = useActionState(
    async (prev: { error?: string } | null, fd: FormData) => {
      if (!editId) return null;
      const r = await updateGoal(editId, fd);
      if (!r?.error) setEditId(null);
      return r ?? null;
    },
    null
  );

  const [deleteState, deleteAction, deletePending] = useActionState(
    async (prev: { error?: string } | null) => {
      if (!deleteId) return null;
      const r = await deleteGoal(deleteId);
      if (!r?.error) setDeleteId(null);
      return r ?? null;
    },
    null
  );

  const [topUpState, topUpAction, topUpPending] = useActionState(
    async (prev: { error?: string } | null) => {
      if (!topUpId) return null;
      const r = await updateGoalProgress(topUpId, Number(topUpAmount) || 0);
      if (!r?.error) { setTopUpId(null); setTopUpAmount(""); }
      return r ?? null;
    },
    null
  );

  const editing = goals.find((g) => g.id === editId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase">Target Tabungan</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="border-4 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm"
        >
          + Baru
        </button>
      </div>

      {showForm && (
        <FadeIn>
          <div className="border-4 border-black bg-card p-4 sm:p-6 shadow-lg">
            <h3 className="font-bold uppercase mb-4">Tambah Target</h3>
            <form action={createAction} className="flex flex-col gap-3">
              <input name="name" placeholder="Nama target" required className="border-4 border-black px-4 py-3 w-full" />
              <input name="target_amount" type="number" placeholder="Jumlah target (Rp)" required min={1} className="border-4 border-black px-4 py-3 w-full" />
              <input name="deadline" type="date" className="border-4 border-black px-4 py-3 w-full" />
              {createState?.error && <p className="text-xs text-danger">{createState.error}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={createPending} className="flex-1 border-4 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-sm transition-all disabled:opacity-50">
                  {createPending ? "..." : "Simpan"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border-4 border-black bg-card px-4 py-2 font-bold uppercase shadow-sm">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </FadeIn>
      )}

      {!goals.length && !showForm && <p className="text-sm">Belum ada target tabungan.</p>}

      <Stagger className="flex flex-col gap-4">
        {goals.map((g) => {
          const pct = g.target_amount > 0
            ? Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100))
            : 0;
          return (
            <StaggerItem key={g.id}>
              <HoverCard>
                <div className={`border-4 border-black bg-card p-4 sm:p-6 shadow-lg ${g.is_completed ? "opacity-60" : ""}`}>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg truncate">{g.name}</h3>
                      {g.deadline && <p className="text-xs truncate">Deadline: {new Date(g.deadline).toLocaleDateString("id-ID")}</p>}
                    </div>
                    <span className="text-sm font-bold shrink-0">{pct}%</span>
                  </div>
                  <div className="w-full h-4 border-4 border-black bg-card">
                    <div className={`h-full ${g.is_completed ? "bg-success" : "bg-primary"} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-sm mt-1">
                    Rp{Number(g.current_amount).toLocaleString("id-ID")} / Rp{Number(g.target_amount).toLocaleString("id-ID")}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {!g.is_completed && (
                      <button onClick={() => { setTopUpId(g.id); setTopUpAmount(""); }}
                        className="border-2 border-black px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-all">
                        Top Up
                      </button>
                    )}
                    <button onClick={() => { setEditId(g.id); }}
                      className="border-2 border-black px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-all">
                      Edit
                    </button>
                    <button onClick={() => setDeleteId(g.id)}
                      className="border-2 border-black px-2 py-1 text-xs font-bold text-danger hover:bg-danger hover:text-white transition-all">
                      Hapus
                    </button>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* Edit Modal */}
      <Modal open={!!editId} onClose={() => setEditId(null)}>
        <h3 className="font-bold mb-4">Edit Target</h3>
        <form action={editAction} className="flex flex-col gap-3">
          <input name="name" defaultValue={editing?.name} placeholder="Nama target" required className="border-4 border-black px-4 py-3 w-full" />
          <input name="target_amount" type="number" defaultValue={editing?.target_amount?.toString()} placeholder="Jumlah" required min={1} className="border-4 border-black px-4 py-3 w-full" />
          <input name="deadline" type="date" defaultValue={editing?.deadline ?? ""} className="border-4 border-black px-4 py-3 w-full" />
          {editState?.error && <p className="text-xs text-danger">{editState.error}</p>}
          <button type="submit" disabled={editPending} className="border-4 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-sm transition-all disabled:opacity-50">
            {editPending ? "..." : "Simpan"}
          </button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)}>
        <p className="font-bold mb-4">Yakin hapus target ini?</p>
        <form action={deleteAction} className="flex gap-2">
          <button type="submit" disabled={deletePending} className="flex-1 border-4 border-black bg-danger px-4 py-2 font-bold text-white uppercase shadow-sm transition-all disabled:opacity-50">
            {deletePending ? "..." : "Hapus"}
          </button>
          <button type="button" onClick={() => setDeleteId(null)} className="flex-1 border-4 border-black bg-card px-4 py-2 font-bold uppercase shadow-sm">
            Batal
          </button>
        </form>
      </Modal>

      {/* Top Up Modal */}
      <Modal open={!!topUpId} onClose={() => { setTopUpId(null); setTopUpAmount(""); }}>
        <p className="font-bold mb-4">Tambah Saldo Target</p>
        <form action={topUpAction} className="flex flex-col gap-3">
          <input type="number" placeholder="Jumlah (Rp)" min={1} value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            className="border-4 border-black px-4 py-3 w-full" />
          {topUpState?.error && <p className="text-xs text-danger">{topUpState.error}</p>}
          <button type="submit" disabled={topUpPending} className="border-4 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-sm transition-all disabled:opacity-50">
            {topUpPending ? "..." : "Tambah"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
