import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import PortfolioClient from "@/components/dashboard/portfolio-builder";

export default async function PortfolioPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <PortfolioClient userId={user.id} />;
}
