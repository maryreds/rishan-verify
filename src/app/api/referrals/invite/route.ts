import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sendEmail } from "@/lib/email";
import { referralInviteEmail } from "@/lib/email-templates/referral-invite";

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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Generate 8-char alphanumeric referral code
    const referralCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    // Get referrer's name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const referrerName = profile?.full_name || "A Vouch member";

    const { data, error } = await supabase
      .from("referrals")
      .insert({
        referrer_id: user.id,
        referee_email: email,
        referral_code: referralCode,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send referral invite email
    const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralCode}`;
    const { subject, html } = referralInviteEmail({
      referrerName,
      signupUrl,
    });

    await sendEmail({ to: email, subject, html });

    return NextResponse.json({ referral: data });
  } catch (error) {
    console.error("Referral invite error:", error);
    return NextResponse.json(
      { error: "Failed to send referral invite" },
      { status: 500 }
    );
  }
}
