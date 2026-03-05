import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch pending verification requests with candidate profile data
  const { data: pendingRequests } = await supabase
    .from("verification_requests")
    .select(`
      *,
      profiles:profile_id (
        full_name,
        email,
        headline,
        skills,
        domains,
        verification_status
      )
    `)
    .in("status", ["pending", "in_review"])
    .order("created_at", { ascending: true });

  // Fetch recently completed verifications
  const { data: completedRequests } = await supabase
    .from("verification_requests")
    .select(`
      *,
      profiles:profile_id (
        full_name,
        email,
        verification_status
      )
    `)
    .in("status", ["completed", "rejected"])
    .order("reviewed_at", { ascending: false })
    .limit(20);

  // Stats
  const { count: totalCandidates } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "candidate");

  const { count: verifiedCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "verified");

  const { count: pendingCount } = await supabase
    .from("verification_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <AdminClient
      user={user}
      pendingRequests={pendingRequests || []}
      completedRequests={completedRequests || []}
      stats={{
        totalCandidates: totalCandidates || 0,
        verified: verifiedCount || 0,
        pending: pendingCount || 0,
      }}
    />
  );
}
