import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import VisitorsClient, {
  type SessionRow,
  type PageViewRow,
} from "./visitors-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VisitorsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/visitors/login");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-12 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-bold">Configuration needed</h1>
          <p className="text-sm text-neutral-600">
            Set <code className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> in
            your environment so this page can read visit data.
          </p>
        </div>
      </div>
    );
  }

  const sb = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: sessionsRaw } = await sb
    .from("visit_sessions")
    .select("*")
    .order("last_seen_at", { ascending: false })
    .limit(300);

  const sessions: SessionRow[] = sessionsRaw ?? [];
  const sessionIds = sessions.map((s) => s.id);

  let views: PageViewRow[] = [];
  if (sessionIds.length > 0) {
    const { data: viewsRaw } = await sb
      .from("page_views")
      .select("*")
      .in("session_id", sessionIds)
      .order("entered_at", { ascending: true });
    views = viewsRaw ?? [];
  }

  return <VisitorsClient sessions={sessions} views={views} />;
}
