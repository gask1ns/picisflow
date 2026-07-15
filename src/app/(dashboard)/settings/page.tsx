import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TelegramLink } from "@/components/telegram/link-status";
import { SettingsClient } from "./client";
import { PageWrapper } from "@/components/motion/page-wrapper";
import { FadeIn } from "@/components/motion/fade-in";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: tgLink } = await supabase
    .from("telegram_links")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <PageWrapper>
      <div className="flex flex-col gap-8 max-w-lg">
        <h2 className="text-3xl font-black uppercase">Settings</h2>

        <FadeIn delay={0.1}>
          <SettingsClient profile={profile} />
        </FadeIn>

        <FadeIn delay={0.2}>
          <TelegramLink link={tgLink ?? null} />
        </FadeIn>
      </div>
    </PageWrapper>
  );
}
