import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import DashboardOverview from "./overview-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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

  const { data: latestVerification } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let profileViewCount = 0;
  try {
    const { count } = await supabase
      .from("profile_views")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id);
    profileViewCount = count ?? 0;
  } catch {
    // Table may not exist yet
  }

  return (
    <DashboardOverview
      user={user}
      profile={profile}
      experience={experience ?? []}
      education={education ?? []}
      latestVerification={latestVerification}
      profileViewCount={profileViewCount}
    />
  );
}
