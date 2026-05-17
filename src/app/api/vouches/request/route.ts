import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sendEmail } from "@/lib/email";
import { vouchReceivedEmail } from "@/lib/email-templates/vouch-received";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { voucheeId, voucheeEmail, voucheeName, skill, message } = body;

    if (!skill) {
      return NextResponse.json(
        { error: "Skill is required" },
        { status: 400 }
      );
    }
    if (!voucheeId && !voucheeEmail) {
      return NextResponse.json(
        { error: "Provide either a candidate or an email" },
        { status: 400 }
      );
    }

    const { data: voucherProfile } = await supabase
      .from("profiles")
      .select("full_name, verification_status, vouch_score")
      .eq("id", user.id)
      .single();

    const voucherName = voucherProfile?.full_name || "A colleague";

    // If a direct candidate was selected, create the peer_vouch record.
    if (voucheeId) {
      if (
        !voucherProfile ||
        voucherProfile.verification_status !== "verified"
      ) {
        return NextResponse.json(
          { error: "You must be verified to vouch for others" },
          { status: 403 }
        );
      }

      const { data, error } = await supabase
        .from("peer_vouches")
        .insert({
          voucher_id: user.id,
          vouchee_id: voucheeId,
          skill,
          message: message || null,
          voucher_score: voucherProfile.vouch_score || 0,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ vouch: data });
    }

    // Email-based flow: send an invitation/notification email.
    const to = String(voucheeEmail).trim();
    const name = String(voucheeName || "there").trim();
    const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vouch-app-xi.vercel.app"}/signup?invited_email=${encodeURIComponent(to)}`;

    const { subject, html } = vouchReceivedEmail({
      voucherName,
      voucheeName: name,
      skill,
      message: message || null,
      signupUrl,
    });

    await sendEmail({ to, subject, html });

    return NextResponse.json({ emailed: to });
  } catch (error) {
    console.error("Vouch request error:", error);
    return NextResponse.json(
      { error: "Failed to create vouch" },
      { status: 500 }
    );
  }
}
