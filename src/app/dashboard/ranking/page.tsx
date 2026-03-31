import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import RankingClient from "@/components/dashboard/ranking-insights";

export default async function RankingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <RankingClient />;
}
