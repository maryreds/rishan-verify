import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { token, responses } = body;

    if (!token || !responses) {
      return NextResponse.json(
        { error: "Token and responses are required" },
        { status: 400 }
      );
    }

    // Look up reference by token
    const { data: reference, error: fetchError } = await supabase
      .from("references")
      .select("*")
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

    // Update the reference with responses
    const { data, error } = await supabase
      .from("references")
      .update({
        responses,
        status: "completed",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", reference.id)
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
