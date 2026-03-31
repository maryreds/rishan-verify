import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AssessmentListClient from "@/components/dashboard/assessment-list";

export default async function AssessmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: skills } = await supabase
    .from("skills")
    .select("name, verified, category")
    .eq("profile_id", user.id);

  const { data: assessments } = await supabase
    .from("assessments")
    .select("id, skill_name, score, max_score, status, completed_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AssessmentListClient
      skills={skills ?? []}
      assessments={assessments ?? []}
    />
  );
}
