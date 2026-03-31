import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import InterviewListClient from "@/components/dashboard/interview-list";

export default async function InterviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select("id, target_role, target_company, score, status, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return <InterviewListClient sessions={sessions || []} />;
}
