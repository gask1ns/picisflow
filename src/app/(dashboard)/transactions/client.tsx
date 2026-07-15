"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { PageWrapper } from "@/components/motion/page-wrapper";
import { Stagger } from "@/components/motion/stagger";
import { FadeIn } from "@/components/motion/fade-in";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteTransaction } from "@/lib/transactions/actions";

type Tx = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  date: string;
  categoryName: string | null;
  categoryIcon: string | null;
};

type Cat = {
  id: string;
  name: string;
  icon: string | null;
  type: string;
};

const typeLabels: Record<string, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
};

export function TransactionsClient({
  transactions,
  categories,
  defaultCategory,
  defaultFrom,
  defaultTo,
  page,
  totalPages,
}: {
  transactions: Tx[];
  categories: Cat[];
  defaultCategory?: string;
  defaultFrom?: string;
  defaultTo?: string;
  page: number;
  totalPages: number;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [state, action, pending] = useActionState(
    async (prev: { error?: string } | null) => {
      if (!deleteId) return null;
      const result = await deleteTransaction(deleteId);
      setDeleteId(null);
      return result ?? null;
    },
    null
  );

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (defaultCategory) params.set("category", defaultCategory);
    if (defaultFrom) params.set("from", defaultFrom);
    if (defaultTo) params.set("to", defaultTo);
    if (p > 1) params.set("page", String(p));
    return `/transactions${params.toString() ? "?" + params.toString() : ""}`;
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase">Transaksi</h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/api/transactions/export${buildUrl(1).replace("/transactions", "")}`}
              className="border-4 border-black bg-card px-4 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all text-xs"
            >
              Export CSV
            </Link>
            <Link
              href="/transactions/new"
              className="border-4 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all text-sm"
            >
              + Baru
            </Link>
          </div>
        </div>

        <FadeIn>
          <form className="flex flex-wrap gap-2 items-end">
            <select
              name="category"
              defaultValue={defaultCategory ?? ""}
              className="border-4 border-black px-3 py-2 text-sm w-full sm:w-auto"
            >
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon ?? "📄"} {c.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="from"
              defaultValue={defaultFrom}
              className="border-4 border-black px-3 py-2 text-sm flex-1 sm:flex-none"
            />
            <input
              type="date"
              name="to"
              defaultValue={defaultTo}
              className="border-4 border-black px-3 py-2 text-sm flex-1 sm:flex-none"
            />
            <button
              type="submit"
              className="border-4 border-black bg-card px-4 py-2 font-bold text-sm shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-xs transition-all w-full sm:w-auto"
            >
              Filter
            </button>
          </form>
        </FadeIn>

        <Stagger className="flex flex-col gap-2">
          {!transactions.length && (
            <p className="py-8 text-center text-sm">
              Belum ada transaksi. Mulai catat!
            </p>
          )}
          {transactions.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link href={`/transactions/${t.id}`} className="flex items-center gap-1.5">
                        <span>{t.categoryIcon ?? "📄"}</span>
                        <span className="font-bold truncate max-w-[120px]">
                          {t.categoryName ?? "Tanpa kategori"}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/transactions/${t.id}`} className="text-xs truncate block max-w-[150px]">
                        {t.description || "-"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border-2 border-black ${
                        t.type === "income" ? "bg-success text-white" : "bg-danger text-white"
                      }`}>
                        {typeLabels[t.type]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-black tabular-nums text-xs ${
                        t.type === "income" ? "text-success" : "text-danger"
                      }`}>
                        {t.type === "income" ? "+" : "-"}Rp{t.amount.toLocaleString("id-ID")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {new Date(t.date).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Link
                          href={`/transactions/${t.id}`}
                          className="border-2 border-black px-2 py-0.5 text-[10px] font-bold hover:bg-secondary hover:text-secondary-foreground transition-all"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          className="border-2 border-black px-2 py-0.5 text-[10px] font-bold text-danger hover:bg-danger hover:text-white transition-all"
                        >
                          Hapus
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stagger>

        {totalPages > 1 && (
          <FadeIn>
            <div className="flex items-center justify-between border-4 border-black bg-card p-4 shadow-md">
              {page > 1 ? (
                <Link href={buildUrl(page - 1)} className="border-2 border-black px-3 py-1.5 text-sm font-bold hover:bg-secondary hover:text-secondary-foreground transition-all">
                  ◀ Sebelumnya
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-sm opacity-30">◀ Sebelumnya</span>
              )}
              <span className="text-sm font-bold">
                Hal {page} dari {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={buildUrl(page + 1)} className="border-2 border-black px-3 py-1.5 text-sm font-bold hover:bg-secondary hover:text-secondary-foreground transition-all">
                  Selanjutnya ▶
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-sm opacity-30">Selanjutnya ▶</span>
              )}
            </div>
          </FadeIn>
        )}

        <Modal open={!!deleteId} onClose={() => setDeleteId(null)}>
          <p className="font-bold mb-4">Yakin hapus transaksi ini?</p>
          <form action={action} className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 border-4 border-black bg-danger px-4 py-2 font-bold text-white uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50"
            >
              {pending ? "..." : "Hapus"}
            </button>
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              className="flex-1 border-4 border-black bg-card px-4 py-2 font-bold uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              Batal
            </button>
          </form>
          {state?.error && (
            <p className="text-xs text-danger mt-2">{state.error}</p>
          )}
        </Modal>
      </div>
    </PageWrapper>
  );
}
