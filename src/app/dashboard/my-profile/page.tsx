import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import MyProfileClient from "./my-profile-client";

export default async function MyProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/dashboard/profile");
  }

  // Fetch all candidate data in parallel
  const [
    { data: experience },
    { data: education },
    { data: skills },
    { data: latestVerification },
    { data: completedRefs },
    { data: peerVouches },
    { data: portfolioItems },
    { data: credentials },
    { data: assessments },
  ] = await Promise.all([
    supabase
      .from("work_experience")
      .select("*")
      .eq("profile_id", user.id)
      .order("start_date", { ascending: false }),
    supabase
      .from("education")
      .select("*")
      .eq("profile_id", user.id)
      .order("start_date", { ascending: false }),
    supabase
      .from("skills")
      .select("*")
      .eq("profile_id", user.id),
    supabase
      .from("verification_requests")
      .select("immigration_status, status_valid_until, reviewed_at, status")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("references")
      .select("*")
      .eq("profile_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("peer_vouches")
      .select("*, voucher:voucher_id(full_name, photo_original_url, headline)")
      .eq("vouchee_id", user.id)
      .eq("status", "accepted"),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("profile_id", user.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("credentials")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("assessments")
      .select("skill_name, score, max_score")
      .eq("profile_id", user.id)
      .eq("status", "completed"),
  ]);

  return (
    <MyProfileClient
      profile={profile}
      experience={experience ?? []}
      education={education ?? []}
      skills={skills ?? []}
      latestVerification={latestVerification}
      completedRefs={completedRefs ?? []}
      peerVouches={peerVouches ?? []}
      portfolioItems={portfolioItems ?? []}
      credentials={credentials ?? []}
      assessments={assessments ?? []}
    />
  );
}
