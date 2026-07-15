"use client";

import { useActionState, useState } from "react";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { FadeIn } from "@/components/motion/fade-in";
import { HoverCard } from "@/components/motion/hover-card";
import { Modal } from "@/components/ui/modal";
import { createRecurring, deleteRecurring, toggleRecurringAction } from "@/lib/recurring/actions";

type Rec = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  frequency: string;
  interval_value: number;
  day_of_month: number | null;
  day_of_week: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  last_generated_date: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
};

type Cat = { id: string; name: string; icon: string | null; type: string };

const freqLabel: Record<string, string> = {
  daily: "Setiap hari",
  weekly: "Setiap minggu",
  monthly: "Setiap bulan",
  yearly: "Setiap tahun",
};

export function RecurringClient({
  recurring,
  categories,
}: {
  recurring: Rec[];
  categories: Cat[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [createState, createAction, createPending] = useActionState(
    async (prev: { error?: string } | null, fd: FormData) => {
      const r = await createRecurring(fd);
      if (!r?.error) setShowForm(false);
      return r ?? null;
    },
    null
  );

  const [deleteState, deleteAction, deletePending] = useActionState(
    async (prev: { error?: string } | null) => {
      if (!deleteId) return null;
      const r = await deleteRecurring(deleteId);
      if (!r?.error) setDeleteId(null);
      return r ?? null;
    },
    null
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase">Transaksi Berulang</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="border-4 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-md hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm"
        >
          + Baru
        </button>
      </div>

      {showForm && (
        <FadeIn>
          <div className="border-4 border-black bg-card p-4 sm:p-6 shadow-lg">
            <h3 className="font-bold uppercase mb-4">Tambah Transaksi Berulang</h3>
            <form action={createAction} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <label className="flex-1 border-4 border-black px-4 py-3 text-center font-bold cursor-pointer bg-danger text-white">
                  <input type="radio" name="type" value="expense" defaultChecked className="sr-only" />
                  Pengeluaran
                </label>
                <label className="flex-1 border-4 border-black px-4 py-3 text-center font-bold cursor-pointer bg-card">
                  <input type="radio" name="type" value="income" className="sr-only" />
                  Pemasukan
                </label>
              </div>

              <input name="amount" type="number" placeholder="Jumlah (Rp)" required min={1} className="border-4 border-black px-4 py-3 w-full" />

              <select name="category_id" className="border-4 border-black px-4 py-3 w-full">
                <option value="">Tanpa kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon ?? "📄"} {c.name}</option>
                ))}
              </select>

              <input name="description" placeholder="Catatan" className="border-4 border-black px-4 py-3 w-full" />

              <select name="frequency" className="border-4 border-black px-4 py-3 w-full">
                <option value="monthly">Bulanan</option>
                <option value="weekly">Mingguan</option>
                <option value="daily">Harian</option>
                <option value="yearly">Tahunan</option>
              </select>

              <div className="flex gap-2">
                <input name="start_date" type="date" required className="flex-1 border-4 border-black px-4 py-3" />
                <input name="end_date" type="date" className="flex-1 border-4 border-black px-4 py-3" placeholder="Selesai (opsional)" />
              </div>

              {createState?.error && <p className="text-xs text-danger">{createState.error}</p>}

              <button type="submit" disabled={createPending} className="border-4 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-sm transition-all disabled:opacity-50">
                {createPending ? "..." : "Simpan"}
              </button>
            </form>
            <button onClick={() => setShowForm(false)} className="mt-2 text-xs font-bold underline">
              Batal
            </button>
          </div>
        </FadeIn>
      )}

      {!recurring.length && !showForm && (
        <p className="text-sm">Belum ada transaksi berulang.</p>
      )}

      <Stagger className="flex flex-col gap-2">
        {recurring.map((r) => (
          <StaggerItem key={r.id}>
            <HoverCard>
              <div className="border-4 border-black bg-card p-4 shadow-md flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0">{r.categoryIcon ?? "📄"}</span>
                    <span className="font-bold text-sm truncate">{r.categoryName ?? "Tanpa kategori"}</span>
                    {!r.is_active && (
                      <span className="text-[10px] bg-secondary text-secondary-foreground px-1 uppercase shrink-0">Nonaktif</span>
                    )}
                  </div>
                  <p className="text-xs truncate">{freqLabel[r.frequency]} · Rp{Number(r.amount).toLocaleString("id-ID")}</p>
                  {r.description && <p className="text-xs truncate">{r.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <form action={toggleRecurringAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="active" value={(!r.is_active).toString()} />
                    <button type="submit" className="border-2 border-black px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-all">
                      {r.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </form>
                  <button onClick={() => setDeleteId(r.id)} className="border-2 border-black px-2 py-1 text-xs font-bold text-danger hover:bg-danger hover:text-white transition-all">
                    Hapus
                  </button>
                </div>
              </div>
            </HoverCard>
          </StaggerItem>
        ))}
      </Stagger>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)}>
        <p className="font-bold mb-4">Yakin hapus transaksi berulang ini?</p>
        <form action={deleteAction} className="flex gap-2">
          <button type="submit" disabled={deletePending} className="flex-1 border-4 border-black bg-danger px-4 py-2 font-bold text-white uppercase shadow-sm transition-all disabled:opacity-50">
            {deletePending ? "..." : "Hapus"}
          </button>
          <button type="button" onClick={() => setDeleteId(null)} className="flex-1 border-4 border-black bg-card px-4 py-2 font-bold uppercase shadow-sm">
            Batal
          </button>
        </form>
      </Modal>
    </div>
  );
}
