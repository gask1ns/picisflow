"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useSound } from "@/hooks/useSound";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  type: string;
};

type Defaults = {
  type?: string;
  amount?: number;
  category_id?: string;
  description?: string;
  date?: string;
};

export function TransactionForm({
  categories,
  action,
  defaultValues,
}: {
  categories: Category[];
  action: (fd: FormData) => Promise<{ error?: string } | undefined>;
  defaultValues?: Defaults;
}) {
  const { playSuccess } = useSound();
  const prevPending = useRef(false);

  const [state, formAction, pending] = useActionState(
    async (_: { error?: string } | null, fd: FormData) => {
      const result = await action(fd);
      return result ?? null;
    },
    null
  );

  useEffect(() => {
    if (prevPending.current && !pending && state && !state.error) {
      playSuccess();
    }
    prevPending.current = pending;
  }, [pending, state, playSuccess]);

  const [type, setType] = useState(defaultValues?.type ?? "expense");
  const filtered = categories.filter((c) => c.type === type);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`flex-1 border-4 border-black px-4 py-3 text-center font-bold transition-all ${
            type === "expense"
              ? "bg-danger text-white"
              : "bg-white text-black"
          }`}
        >
          <input type="hidden" name="type" value={type} />
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`flex-1 border-4 border-black px-4 py-3 text-center font-bold transition-all ${
            type === "income"
              ? "bg-success text-white"
              : "bg-white text-black"
          }`}
        >
          Pemasukan
        </button>
      </div>

      <input
        name="amount"
        type="number"
        placeholder="Jumlah (Rp)"
        required
        min={1}
        defaultValue={defaultValues?.amount?.toString() ?? ""}
        className="border-4 border-black px-4 py-3 text-lg font-bold w-full"
      />

      <select
        name="category_id"
        defaultValue={defaultValues?.category_id ?? ""}
        className="border-4 border-black px-4 py-3 w-full"
        key={type}
      >
        <option value="">Tanpa kategori</option>
        {filtered.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon ?? "📄"} {c.name}
          </option>
        ))}
      </select>

      <input
        name="description"
        placeholder="Catatan (opsional)"
        defaultValue={defaultValues?.description ?? ""}
        className="border-4 border-black px-4 py-3 w-full"
      />

      <input
        name="date"
        type="date"
        defaultValue={
          defaultValues?.date ?? new Date().toISOString().split("T")[0]
        }
        className="border-4 border-black px-4 py-3 w-full"
      />

      {state?.error && (
        <p className="text-sm text-danger">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="border-4 border-black bg-primary px-6 py-3 font-bold text-white uppercase shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all disabled:opacity-50"
      >
        {pending ? "..." : "Simpan"}
      </button>
    </form>
  );
}
