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

  // If returning from Persona verification, check for updated status
  // and advance to the next step if still on verify step
  if (profile && !profile.verification_status) {
    const { data: verReq } = await supabase
      .from("verification_requests")
      .select("status")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (verReq?.status) {
      const mappedStatus =
        verReq.status === "completed" ? "verified" : verReq.status === "persona_pending" ? "pending" : null;
      if (mappedStatus) {
        await supabase
          .from("profiles")
          .update({ verification_status: mappedStatus })
          .eq("id", user.id);
        if (profile) {
          profile.verification_status = mappedStatus;
        }
      }
    }
  }

  return <OnboardingClient user={user} profile={profile} />;
}
