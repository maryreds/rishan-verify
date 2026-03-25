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
    .select("full_name, verification_status")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <DashboardSidebar />
      <main className="ml-64 min-h-screen p-8 lg:p-12 bg-[#faf9f5]">
        {children}
      </main>
    </div>
  );
}
