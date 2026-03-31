import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vouches received (where I'm the vouchee)
    const { data: received, error: receivedError } = await supabase
      .from("peer_vouches")
      .select("*, voucher:profiles!peer_vouches_voucher_id_fkey(id, full_name, photo_original_url)")
      .eq("vouchee_id", user.id)
      .order("created_at", { ascending: false });

    if (receivedError) {
      return NextResponse.json(
        { error: receivedError.message },
        { status: 500 }
      );
    }

    // Vouches given (where I'm the voucher)
    const { data: given, error: givenError } = await supabase
      .from("peer_vouches")
      .select("*, vouchee:profiles!peer_vouches_vouchee_id_fkey(id, full_name, photo_original_url)")
      .eq("voucher_id", user.id)
      .order("created_at", { ascending: false });

    if (givenError) {
      return NextResponse.json(
        { error: givenError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: received || [], given: given || [] });
  } catch (error) {
    console.error("Vouches list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vouches" },
      { status: 500 }
    );
  }
}
