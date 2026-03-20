import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createInquiry } from "@/lib/persona";

export async function POST(request: Request) {
  if (!process.env.PERSONA_API_KEY) {
    return NextResponse.json(
      { error: "Persona identity verification is not configured. Please contact support." },
      { status: 503 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { origin } = new URL(request.url);
    const redirectUri = `${origin}/dashboard?tab=verify`;

    const response = await createInquiry(user.id, redirectUri);

    const inquiryId = response.data?.id;
    const sessionUrl =
      response.meta?.sessionToken
        ? `https://withpersona.com/verify?inquiry-id=${inquiryId}&session-token=${response.meta.sessionToken}`
        : null;

    if (!inquiryId) {
      throw new Error("No inquiry ID returned from Persona");
    }

    // Upsert a verification_requests record with the persona inquiry ID
    const { error: upsertError } = await supabase
      .from("verification_requests")
      .upsert(
        {
          profile_id: user.id,
          persona_inquiry_id: inquiryId,
          status: "persona_pending",
          created_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" }
      );

    if (upsertError) {
      console.error("Failed to save verification request:", upsertError);
      // Don't block the user — the inquiry was already created
    }

    // Update profile verification status
    await supabase
      .from("profiles")
      .update({ verification_status: "pending" })
      .eq("id", user.id);

    // Log the action
    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "persona_inquiry_created",
      target_type: "verification_request",
      target_id: inquiryId,
    });

    return NextResponse.json({
      inquiryId,
      sessionUrl,
    });
  } catch (err) {
    console.error("Persona create inquiry error:", err);
    const message = err instanceof Error ? err.message : "Failed to create verification session";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
