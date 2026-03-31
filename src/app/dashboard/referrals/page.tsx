import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ReferralDashboardClient from "@/components/dashboard/referral-dashboard";

export default async function ReferralsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <ReferralDashboardClient userId={user.id} />;
}
