import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransactionsClient } from "./client";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; from?: string; to?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const limit = 25;
  const offset = (page - 1) * limit;

  let countQuery = supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  let dataQuery = supabase
    .from("transactions")
    .select("*, categories(name, icon)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (params.category) {
    countQuery = countQuery.eq("category_id", params.category);
    dataQuery = dataQuery.eq("category_id", params.category);
  }
  if (params.from) {
    countQuery = countQuery.gte("date", params.from);
    dataQuery = dataQuery.gte("date", params.from);
  }
  if (params.to) {
    countQuery = countQuery.lte("date", params.to);
    dataQuery = dataQuery.lte("date", params.to);
  }

  const { count } = await countQuery;
  const { data: tx } = await dataQuery;

  const totalPages = Math.ceil((count ?? 0) / limit);

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, icon, type")
    .or(`user_id.eq.${user.id},user_id.is.null`);

  const raw = tx?.map((t) => ({
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    description: t.description,
    date: t.date,
    categoryName: t.categories?.name ?? null,
    categoryIcon: t.categories?.icon ?? null,
  })) ?? [];

  return (
    <TransactionsClient
      transactions={raw}
      categories={cats ?? []}
      defaultCategory={params.category}
      defaultFrom={params.from}
      defaultTo={params.to}
      page={page}
      totalPages={totalPages}
    />
  );
}
