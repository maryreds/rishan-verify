import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import VideoRecorder from "@/components/dashboard/video-recorder";

export default async function VideoPage() {
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

  return <VideoRecorder user={user} profile={profile} />;
}
