import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import PublishedClient from "./published-client";

export default async function OnboardingPublishedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, vanity_slug, public_slug, published_at, onboarding_completed_at"
    )
    .eq("id", user.id)
    .single();

  // If the candidate hasn't actually published yet, send them back to
  // onboarding to finish — this page is only meaningful post-publish.
  if (!profile?.published_at) {
    redirect("/onboarding");
  }

  const slug = profile.vanity_slug || profile.public_slug;
  if (!slug) {
    // Defensive: publish flow always sets a slug, but if something went
    // wrong upstream just bounce them to the dashboard rather than render
    // a broken share screen.
    redirect("/dashboard");
  }

  const firstName = (profile.full_name || "").split(" ")[0] || "there";

  return <PublishedClient firstName={firstName} slug={slug} />;
}
