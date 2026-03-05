import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check if admin — redirect to admin dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  // Fetch candidate data
  const { data: experience } = await supabase
    .from("work_experience")
    .select("*")
    .eq("profile_id", user.id)
    .order("start_date", { ascending: false });

  const { data: education } = await supabase
    .from("education")
    .select("*")
    .eq("profile_id", user.id)
    .order("start_date", { ascending: false });

  const { data: verificationRequests } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  return (
    <DashboardClient
      user={user}
      profile={profile}
      experience={experience || []}
      education={education || []}
      latestVerification={verificationRequests?.[0] || null}
    />
  );
}
