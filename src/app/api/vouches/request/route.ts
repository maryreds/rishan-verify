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
    const { voucheeId, skill, message } = body;

    if (!voucheeId || !skill) {
      return NextResponse.json(
        { error: "Vouchee and skill are required" },
        { status: 400 }
      );
    }

    // Check voucher is verified
    const { data: voucherProfile } = await supabase
      .from("profiles")
      .select("verification_status, vouch_score")
      .eq("id", user.id)
      .single();

    if (!voucherProfile || voucherProfile.verification_status !== "verified") {
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
  } catch (error) {
    console.error("Vouch request error:", error);
    return NextResponse.json(
      { error: "Failed to create vouch" },
      { status: 500 }
    );
  }
}
