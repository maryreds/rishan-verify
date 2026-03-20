import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin via is_admin column
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  const { data: pendingRequests } = await supabase
    .from("verification_requests")
    .select("*, profiles(full_name, email, headline)")
    .in("status", ["pending", "in_review"])
    .order("created_at", { ascending: true });

  const { data: completedRequests } = await supabase
    .from("verification_requests")
    .select("*, profiles(full_name, email)")
    .in("status", ["completed", "rejected"])
    .order("reviewed_at", { ascending: false })
    .limit(20);

  const { count: totalCandidates } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: verified } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "verified");

  const { count: pending } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "pending");

  return (
    <AdminClient
      user={user}
      pendingRequests={pendingRequests ?? []}
      completedRequests={completedRequests ?? []}
      stats={{
        totalCandidates: totalCandidates ?? 0,
        verified: verified ?? 0,
        pending: pending ?? 0,
      }}
    />
  );
}
