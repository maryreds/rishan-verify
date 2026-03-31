import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ReferenceManagerClient from "@/components/dashboard/reference-manager";

export default async function ReferencesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <ReferenceManagerClient userId={user.id} />;
}
