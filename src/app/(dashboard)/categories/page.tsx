import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageWrapper } from "@/components/motion/page-wrapper";
import { CategoriesClient } from "./client";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cats } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order("type")
    .order("name");

  return (
    <PageWrapper>
      <CategoriesClient categories={cats ?? []} />
    </PageWrapper>
  );
}
