"use client";

import { useActionState, useState } from "react";
import { PageWrapper } from "@/components/motion/page-wrapper";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { FadeIn } from "@/components/motion/fade-in";
import { HoverCard } from "@/components/motion/hover-card";
import { Modal } from "@/components/ui/modal";
import { createDebt, updateDebt, deleteDebt, toggleDebtPaid } from "@/lib/debts/actions";

type Debt = {
  id: string;
  counterparty_name: string;
  type: "owe" | "owed";
  amount: number;
  description: string | null;
  due_date: string | null;
  is_paid: boolean;
};

export function DebtsClient({ debts }: { debts: Debt[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formType, setFormType] = useState<"owe" | "owed">("owe");

  const totalOwe = debts
    .filter((d) => d.type === "owe" && !d.is_paid)
    .reduce((s, d) => s + Number(d.amount), 0);
  const totalOwed = debts
    .filter((d) => d.type === "owed" && !d.is_paid)
    .reduce((s, d) => s + Number(d.amount), 0);

  const [createState, createAction, createPending] = useActionState(
    async (prev: { error?: string } | null, fd: FormData) => {
      const r = await createDebt(fd);
      if (!r?.error) setShowForm(false);
      return r ?? null;
    },
    null
  );

  const [editState, editAction, editPending] = useActionState(
    async (prev: { error?: string } | null, fd: FormData) => {
      if (!editId) return null;
      const r = await updateDebt(editId, fd);
      if (!r?.error) setEditId(null);
      return r ?? null;
    },
    null
  );

  const [, deleteAction, deletePending] = useActionState(
    async (_prev: { error?: string } | null) => {
      if (!deleteId) return null;
      const r = await deleteDebt(deleteId);
      if (!r?.error) setDeleteId(null);
      return r ?? null;
    },
    null
  );

  const editing = debts.find((d) => d.id === editId);

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase">Hutang / Piutang</h2>
          <button
            onClick={() => { setShowForm(true); setFormType("owe"); }}
            className="border-2 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-md hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm"
          >
            + Baru
          </button>
        </div>

        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border-2 border-black bg-danger text-white p-4 sm:p-6 shadow-lg">
              <p className="text-xs font-bold uppercase">Gue Hutang</p>
              <p className="text-xl sm:text-2xl font-black break-all">Rp{totalOwe.toLocaleString("id-ID")}</p>
            </div>
            <div className="border-2 border-black bg-success text-white p-4 sm:p-6 shadow-lg">
              <p className="text-xs font-bold uppercase">Dihutangi</p>
              <p className="text-xl sm:text-2xl font-black break-all">Rp{totalOwed.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </FadeIn>

        {!debts.length && !showForm && (
          <p className="text-sm">Belum ada catatan hutang/piutang.</p>
        )}

        {/* Add Form */}
        {showForm && (
          <FadeIn>
            <div className="border-2 border-black bg-card p-4 sm:p-6 shadow-lg">
              <h3 className="font-bold uppercase mb-4">Tambah Catatan</h3>
              <form action={createAction} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType("owe")}
                    className={`flex-1 border-2 border-black px-4 py-3 text-center font-bold transition-all ${formType === "owe" ? "bg-danger text-white" : "bg-card text-black"}`}
                  >
                    <input type="hidden" name="type" value={formType} />
                    Gue Hutang
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("owed")}
                    className={`flex-1 border-2 border-black px-4 py-3 text-center font-bold transition-all ${formType === "owed" ? "bg-success text-white" : "bg-card text-black"}`}
                  >
                    Dihutangi
                  </button>
                </div>
                <input name="counterparty_name" placeholder="Nama orang" required className="border-2 border-black px-4 py-3 w-full" />
                <input name="amount" type="number" placeholder="Jumlah (Rp)" required min={1} className="border-2 border-black px-4 py-3 w-full" />
                <input name="description" placeholder="Catatan (opsional)" className="border-2 border-black px-4 py-3 w-full" />
                <input name="due_date" type="date" className="border-2 border-black px-4 py-3 w-full" />
                {createState?.error && <p className="text-xs text-danger">{createState.error}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={createPending} className="flex-1 border-2 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-sm transition-all disabled:opacity-50">
                    {createPending ? "..." : "Simpan"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 border-2 border-black bg-card px-4 py-2 font-bold uppercase shadow-sm">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </FadeIn>
        )}

        {/* List */}
        <Stagger className="flex flex-col gap-2">
          {debts.map((d) => (
            <StaggerItem key={d.id}>
              <HoverCard>
                <div className={`border-2 border-black bg-card p-4 shadow-md ${d.is_paid ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">{d.counterparty_name}</p>
                      {d.description && <p className="text-xs truncate">{d.description}</p>}
                      {d.due_date && (
                        <p className="text-xs">Jatuh tempo: {new Date(d.due_date).toLocaleDateString("id-ID")}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-black ${d.type === "owe" ? "text-danger" : "text-success"}`}>
                        {d.type === "owe" ? "-" : "+"}Rp{Number(d.amount).toLocaleString("id-ID")}
                      </p>
                      {d.is_paid && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 font-bold uppercase">Lunas</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleDebtPaid(d.id, !d.is_paid)}
                      className={`border-2 border-black px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-all ${d.is_paid ? "bg-black text-white" : ""}`}>
                      {d.is_paid ? "Batal Lunas" : "Tandai Lunas"}
                    </button>
                    <button onClick={() => setEditId(d.id)}
                      className="border-2 border-black px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-all">
                      Edit
                    </button>
                    <button onClick={() => setDeleteId(d.id)}
                      className="border-2 border-black px-2 py-1 text-xs font-bold text-danger hover:bg-danger hover:text-white transition-all">
                      Hapus
                    </button>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Edit Modal */}
        <Modal open={!!editId} onClose={() => setEditId(null)}>
          <h3 className="font-bold mb-4">Edit Catatan</h3>
          <form action={editAction} className="flex flex-col gap-3">
            <input name="counterparty_name" defaultValue={editing?.counterparty_name} placeholder="Nama orang" required className="border-2 border-black px-4 py-3 w-full" />
            <input name="amount" type="number" defaultValue={editing?.amount?.toString()} placeholder="Jumlah" required min={1} className="border-2 border-black px-4 py-3 w-full" />
            <input name="description" defaultValue={editing?.description ?? ""} placeholder="Catatan (opsional)" className="border-2 border-black px-4 py-3 w-full" />
            <input name="due_date" type="date" defaultValue={editing?.due_date ?? ""} className="border-2 border-black px-4 py-3 w-full" />
            <input type="hidden" name="type" value={editing?.type ?? "owe"} />
            {editState?.error && <p className="text-xs text-danger">{editState.error}</p>}
            <button type="submit" disabled={editPending} className="border-2 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-sm transition-all disabled:opacity-50">
              {editPending ? "..." : "Simpan"}
            </button>
          </form>
        </Modal>

        {/* Delete Modal */}
        <Modal open={!!deleteId} onClose={() => setDeleteId(null)}>
          <p className="font-bold mb-4">Yakin hapus catatan ini?</p>
          <form action={deleteAction} className="flex gap-2">
            <button type="submit" disabled={deletePending} className="flex-1 border-2 border-black bg-danger px-4 py-2 font-bold text-white uppercase shadow-sm transition-all disabled:opacity-50">
              {deletePending ? "..." : "Hapus"}
            </button>
            <button type="button" onClick={() => setDeleteId(null)} className="flex-1 border-2 border-black bg-card px-4 py-2 font-bold uppercase shadow-sm">
              Batal
            </button>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
}
