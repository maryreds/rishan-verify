import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ResumeClient from "./resume-client";

export default async function ResumePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return <ResumeClient user={user} profile={profile} />;
}
