import { NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAuth } from "@/lib/api-auth";
import { welcomeEmail } from "@/lib/email-templates/welcome";

const FROM_EMAIL = "Vouch <hello@knomadic.io>";
const DASHBOARD_URL = "https://vouch-app-xi.vercel.app/dashboard";

let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export async function POST() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { supabase, userId } = auth;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const email = user?.email;
    if (!email) {
      return NextResponse.json(
        { ok: false, error: "User email not found" },
        { status: 200 }
      );
    }

    // Look up profile + idempotency flag
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, welcome_email_sent_at")
      .eq("id", userId)
      .single();

    if (profile?.welcome_email_sent_at) {
      return NextResponse.json({ ok: true, alreadySent: true });
    }

    const fullName: string =
      profile?.full_name ||
      (user?.user_metadata?.full_name as string | undefined) ||
      "";
    const firstName = fullName.split(" ")[0] || "";

    const resend = getResend();
    if (!resend) {
      console.warn("RESEND_API_KEY not set — skipping welcome email send");
      return NextResponse.json({ ok: false, error: "Email not configured" });
    }

    const { subject, html } = welcomeEmail({
      firstName,
      dashboardUrl: DASHBOARD_URL,
    });

    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    });

    if (sendError) {
      console.error("Welcome email send error:", sendError);
      return NextResponse.json({ ok: false, error: sendError.message });
    }

    // Mark as sent (idempotent). Best-effort — don't fail the response if this errors.
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      console.error("Welcome email flag update failed:", updateError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Welcome email route error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message });
  }
}
