import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import InterviewChat from "@/components/dashboard/interview-chat";

interface InterviewSessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewSessionPage({
  params,
}: InterviewSessionPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (!session) redirect("/dashboard/interview");

  return <InterviewChat session={session} />;
}
