import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { updateTransaction } from "@/lib/transactions/actions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { PageWrapper } from "@/components/motion/page-wrapper";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tx } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!tx) notFound();

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, icon, type")
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order("type")
    .order("name");

  const editAction = updateTransaction.bind(null, id);

  return (
    <PageWrapper>
      <div className="max-w-lg">
        <h2 className="text-3xl font-black uppercase mb-6">Edit Transaksi</h2>
        <TransactionForm
          categories={cats ?? []}
          action={editAction}
          defaultValues={{
            type: tx.type,
            amount: tx.amount,
            category_id: tx.category_id ?? undefined,
            description: tx.description ?? undefined,
            date: tx.date,
          }}
        />
      </div>
    </PageWrapper>
  );
}
