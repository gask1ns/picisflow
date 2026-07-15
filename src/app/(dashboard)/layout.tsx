import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { TelegramLinkBanner } from "@/components/telegram-link-banner";
import { TelegramLinkWatcher } from "@/components/telegram-link-watcher";
import { TelegramLinkProvider } from "@/lib/telegram/link-context";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = adminProfile?.is_admin === true;

  return (
    <TelegramLinkProvider uid={user.id}>
      <SidebarProvider>
        <AppSidebar isAdmin={isAdmin} />
        <SidebarInset>
          <DashboardHeader email={user.email ?? "User"} />
          <TelegramLinkBanner />
          <TelegramLinkWatcher uid={user.id} />
          <main className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-8 pb-20 sm:pb-8">
            {children}
          </main>
        </SidebarInset>
        <BottomNav />
      </SidebarProvider>
    </TelegramLinkProvider>
  );
}
