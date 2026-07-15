import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();

  let userId: string | undefined;
  let category: string | undefined;
  let from: string | undefined;
  let to: string | undefined;

  const token = searchParams.get("token");
  if (token) {
    // Token-based auth (from Telegram export)
    const svc = createServiceClient();
    const { data: t } = await svc
      .from("export_tokens")
      .select("user_id, category, from_date, to_date")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();
    if (!t) return NextResponse.json({ error: "Invalid/expired token" }, { status: 401 });
    userId = t.user_id;
    category = t.category ?? undefined;
    from = t.from_date ?? undefined;
    to = t.to_date ?? undefined;
  } else {
    // Normal auth (from web)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    userId = user.id;
    category = searchParams.get("category") ?? undefined;
    from = searchParams.get("from") ?? undefined;
    to = searchParams.get("to") ?? undefined;
  }

  let query = supabase
    .from("transactions")
    .select("date, type, amount, description, source, categories(name)")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (category) query = query.eq("category_id", category);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data: tx } = await query;

  const header = "Tanggal,Tipe,Kategori,Jumlah,Catatan,Sumber";
  const rows = (tx ?? []).map((t) => {
    const cats = t.categories as unknown as { name: string } | null;
    const cat = (cats as any)?.name ?? (Array.isArray(cats) ? cats[0]?.name : "") ?? "";
    const desc = (t.description ?? "").replace(/"/g, '""');
    const tipe = t.type === "income" ? "Pemasukan" : "Pengeluaran";
    return `${t.date},${tipe},${cat},${t.amount},"${desc}",${t.source}`;
  }).join("\n");

  const bom = "\uFEFF";
  const csv = bom + header + "\n" + rows;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="picisflow-transactions.csv"`,
    },
  });
}
