import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, verification_status, vouch_score")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <DashboardSidebar
        userName={profile?.full_name || user.email?.split("@")[0] || "Candidate"}
        vouchScore={profile?.vouch_score ?? 0}
      />
      <main className="ml-64 min-h-screen p-8 lg:p-12 bg-[#faf9f5]">
        {children}
      </main>
    </div>
  );
}
