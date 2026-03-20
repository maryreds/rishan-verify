import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
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

  // If onboarding is complete, go to dashboard
  if (profile?.onboarding_completed_at) {
    redirect("/dashboard");
  }

  return <OnboardingClient user={user} profile={profile} />;
}
