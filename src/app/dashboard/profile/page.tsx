import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
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

  return (
    <ProfileClient
      user={user}
      profile={profile}
      experience={experience ?? []}
      education={education ?? []}
    />
  );
}
