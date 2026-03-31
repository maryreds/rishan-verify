import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import VouchManagerClient from "@/components/dashboard/vouch-manager";

export default async function VouchesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <VouchManagerClient userId={user.id} />;
}
