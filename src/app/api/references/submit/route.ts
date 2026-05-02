import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Public endpoint hit by referees from a tokenized email link. We validate
// the token here in app code, then write with the service-role client so the
// references_token_submit RLS policy can be tightened without breaking
// submission. Tokens are generated server-side with crypto.randomUUID() at
// request creation time and are unguessable.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, responses } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }
    if (!responses || typeof responses !== "object") {
      return NextResponse.json(
        { error: "Responses are required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: reference, error: fetchError } = await admin
      .from("references")
      .select("id, status")
      .eq("token", token)
      .single();

    if (fetchError || !reference) {
      return NextResponse.json(
        { error: "Reference not found" },
        { status: 404 }
      );
    }

    if (reference.status !== "pending") {
      return NextResponse.json(
        { error: "This reference has already been completed" },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from("references")
      .update({
        responses,
        status: "completed",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", reference.id)
      .eq("status", "pending")
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reference: data });
  } catch (error) {
    console.error("Reference submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit reference" },
      { status: 500 }
    );
  }
}
