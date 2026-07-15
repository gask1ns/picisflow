import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createTransaction } from "@/lib/transactions/actions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { PageWrapper } from "@/components/motion/page-wrapper";

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, icon, type")
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order("type")
    .order("name");

  return (
    <PageWrapper>
      <div className="max-w-lg">
        <h2 className="text-3xl font-black uppercase mb-6">Transaksi Baru</h2>
        <TransactionForm categories={cats ?? []} action={createTransaction} />
      </div>
    </PageWrapper>
  );
}
