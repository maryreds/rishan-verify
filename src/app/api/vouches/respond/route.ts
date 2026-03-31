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
    const { vouchId, action } = body;

    if (!vouchId || !action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Valid vouchId and action (accept/reject) are required" },
        { status: 400 }
      );
    }

    // Verify the user is the vouchee
    const { data: vouch, error: fetchError } = await supabase
      .from("peer_vouches")
      .select("*")
      .eq("id", vouchId)
      .single();

    if (fetchError || !vouch) {
      return NextResponse.json(
        { error: "Vouch not found" },
        { status: 404 }
      );
    }

    if (vouch.vouchee_id !== user.id) {
      return NextResponse.json(
        { error: "You can only respond to vouches made for you" },
        { status: 403 }
      );
    }

    const newStatus = action === "accept" ? "accepted" : "rejected";

    const { data, error } = await supabase
      .from("peer_vouches")
      .update({ status: newStatus })
      .eq("id", vouchId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vouch: data });
  } catch (error) {
    console.error("Vouch respond error:", error);
    return NextResponse.json(
      { error: "Failed to respond to vouch" },
      { status: 500 }
    );
  }
}
