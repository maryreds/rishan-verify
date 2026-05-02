import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Public, unauthenticated waitlist endpoint for /check (the Resume
// Authenticity Score landing page). Stores emails in the
// check_waitlist table (created in 20260502_check_waitlist.sql) and is
// idempotent on email — re-submitting the same address returns 200
// without duplicating.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { error } = await admin
      .from("check_waitlist")
      .upsert({ email, source: "check_landing" }, { onConflict: "email" });

    if (error) {
      console.error("check_waitlist upsert error:", error);
      return NextResponse.json(
        { error: "Could not add to waitlist." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("check_waitlist route error:", error);
    return NextResponse.json(
      { error: "Failed to add to waitlist." },
      { status: 500 }
    );
  }
}
