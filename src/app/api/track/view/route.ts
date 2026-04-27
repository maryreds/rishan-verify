import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: {
    sessionToken?: string;
    visitorId?: string | null;
    path?: string;
    referrer?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { sessionToken, visitorId, path, referrer } = body;
  if (!sessionToken || !path) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const userAgent = req.headers.get("user-agent") ?? null;
  const country = req.headers.get("x-vercel-ip-country") ?? null;
  const city =
    req.headers.get("x-vercel-ip-city")
      ? decodeURIComponent(req.headers.get("x-vercel-ip-city")!)
      : null;

  const supabase = await createClient();

  const { data: sessionId, error: sessionErr } = await supabase.rpc(
    "upsert_visit_session",
    {
      p_session_token: sessionToken,
      p_visitor_id: visitorId ?? null,
      p_ip: ip,
      p_user_agent: userAgent,
      p_country: country,
      p_city: city,
      p_referrer: referrer ?? null,
    }
  );

  if (sessionErr || !sessionId) {
    return NextResponse.json(
      { error: sessionErr?.message ?? "session error" },
      { status: 500 }
    );
  }

  const { data: viewId, error: viewErr } = await supabase.rpc(
    "record_page_view",
    { p_session_id: sessionId, p_path: path }
  );

  if (viewErr) {
    return NextResponse.json({ error: viewErr.message }, { status: 500 });
  }

  return NextResponse.json({ viewId, sessionId });
}
