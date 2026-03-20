import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import EmployerClient from "./employer-client";

export default async function EmployerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has employer role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.is_employer && profile?.role !== "employer") {
    redirect("/dashboard");
  }

  // Fetch verified candidates with work experience and education
  const { data: candidates } = await supabase
    .from("profiles")
    .select("*, work_experience(*), education(*)")
    .eq("verification_status", "verified")
    .order("updated_at", { ascending: false });

  // Fetch employer's saved candidates
  const { data: savedCandidates } = await supabase
    .from("saved_candidates")
    .select("candidate_profile_id, saved_at")
    .eq("employer_id", user.id);

  return (
    <EmployerClient
      user={user}
      profile={profile}
      candidates={candidates ?? []}
      savedCandidateIds={
        savedCandidates?.map((sc) => sc.candidate_profile_id) ?? []
      }
    />
  );
}
