import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getInquiry } from "@/lib/persona";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the user's latest verification request
  const { data: verificationRequest } = await supabase
    .from("verification_requests")
    .select("persona_inquiry_id, status")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!verificationRequest?.persona_inquiry_id) {
    return NextResponse.json({ status: "no_inquiry" });
  }

  // If already completed in our DB, return that
  if (
    verificationRequest.status === "completed" ||
    verificationRequest.status === "rejected" ||
    verificationRequest.status === "expired"
  ) {
    return NextResponse.json({ status: verificationRequest.status });
  }

  // Otherwise check Persona directly
  if (!process.env.PERSONA_API_KEY) {
    return NextResponse.json({ status: verificationRequest.status });
  }

  try {
    const inquiry = await getInquiry(verificationRequest.persona_inquiry_id);
    const personaStatus = inquiry.attributes.status;

    // Map Persona statuses to our statuses
    if (personaStatus === "completed" || personaStatus === "approved") {
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();

      await supabase
        .from("verification_requests")
        .update({
          status: "completed",
          reviewed_at: now.toISOString(),
        })
        .eq("profile_id", user.id);

      await supabase
        .from("profiles")
        .update({
          verification_status: "verified",
          verified_at: now.toISOString(),
          verification_expires_at: expiresAt,
        })
        .eq("id", user.id);

      return NextResponse.json({ status: "completed" });
    }

    if (personaStatus === "failed" || personaStatus === "declined") {
      await supabase
        .from("verification_requests")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("profile_id", user.id);

      await supabase
        .from("profiles")
        .update({ verification_status: "rejected" })
        .eq("id", user.id);

      return NextResponse.json({ status: "rejected" });
    }

    // Still pending
    return NextResponse.json({ status: "persona_pending" });
  } catch (err) {
    console.error("Error checking Persona inquiry status:", err);
    return NextResponse.json({ status: verificationRequest.status });
  }
}
