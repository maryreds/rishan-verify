import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import CredentialVaultClient from "@/components/dashboard/credential-vault";

export default async function CredentialsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <CredentialVaultClient userId={user.id} />;
}
