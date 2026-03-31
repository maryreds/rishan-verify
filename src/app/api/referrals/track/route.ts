import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

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
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    // Find the referral by code
    const { data: referral, error: fetchError } = await supabase
      .from("referrals")
      .select("*")
      .eq("referral_code", referralCode)
      .eq("status", "pending")
      .single();

    if (fetchError || !referral) {
      return NextResponse.json(
        { error: "Referral not found or already used" },
        { status: 404 }
      );
    }

    // Update with the new user's ID
    const { data, error } = await supabase
      .from("referrals")
      .update({
        referee_id: user.id,
        status: "signed_up",
      })
      .eq("id", referral.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, referral: data });
  } catch (error) {
    console.error("Referral track error:", error);
    return NextResponse.json(
      { error: "Failed to track referral" },
      { status: 500 }
    );
  }
}
