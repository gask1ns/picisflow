type Item = {
  label: string;
  icon: string | null;
  amount: number;
  color: string;
};

export function BarChart({ items }: { items: Item[] }) {
  if (!items.length) return null;

  const max = Math.max(...items.map((i) => i.amount));

  if (max === 0) return <p className="text-sm">Belum ada data.</p>;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const pct = (item.amount / max) * 100;
        return (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-base w-6 shrink-0">{item.icon ?? "📄"}</span>
            <span className="text-sm font-bold w-20 truncate shrink-0">
              {item.label}
            </span>
            <div className="flex-1 h-5 border-2 border-black bg-white">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color || "#2563eb",
                }}
              />
            </div>
            <span className="text-sm font-bold w-20 sm:w-24 text-right shrink-0 tabular-nums">
              Rp{item.amount.toLocaleString("id-ID")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
