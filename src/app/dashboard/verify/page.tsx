import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import VerifyClient from "./verify-client";

export default async function VerifyPage() {
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

  const { data: latestVerification } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <VerifyClient
      user={user}
      profile={profile}
      latestVerification={latestVerification}
    />
  );
}
