import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import crypto from "crypto";

const PERSONA_WEBHOOK_SECRET = process.env.PERSONA_WEBHOOK_SECRET;

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: Request) {
  if (!PERSONA_WEBHOOK_SECRET) {
    console.error("PERSONA_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("persona-signature");

  if (!verifyWebhookSignature(rawBody, signature, PERSONA_WEBHOOK_SECRET)) {
    console.error("Invalid Persona webhook signature");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const eventType = event.data?.attributes?.name;
  const inquiryId = event.data?.attributes?.payload?.data?.id;
  const referenceId = event.data?.attributes?.payload?.data?.attributes?.referenceId;

  if (!inquiryId || !referenceId) {
    // Not an inquiry event we care about — acknowledge it
    return NextResponse.json({ received: true });
  }

  const supabase = await createClient();

  try {
    switch (eventType) {
      case "inquiry.completed": {
        const now = new Date();
        const expiresAt = new Date(
          now.getTime() + 365 * 24 * 60 * 60 * 1000
        ).toISOString();

        // Update the verification request
        await supabase
          .from("verification_requests")
          .update({
            status: "completed",
            reviewed_at: now.toISOString(),
            persona_inquiry_id: inquiryId,
          })
          .eq("profile_id", referenceId);

        // Update the profile
        await supabase
          .from("profiles")
          .update({
            verification_status: "verified",
            verified_at: now.toISOString(),
            verification_expires_at: expiresAt,
          })
          .eq("id", referenceId);

        // Audit log
        await supabase.from("audit_log").insert({
          user_id: referenceId,
          action: "persona_inquiry_completed",
          target_type: "verification_request",
          target_id: inquiryId,
          metadata: { event_type: eventType },
        });

        break;
      }

      case "inquiry.failed": {
        await supabase
          .from("verification_requests")
          .update({
            status: "rejected",
            reviewed_at: new Date().toISOString(),
            persona_inquiry_id: inquiryId,
          })
          .eq("profile_id", referenceId);

        await supabase
          .from("profiles")
          .update({ verification_status: "rejected" })
          .eq("id", referenceId);

        await supabase.from("audit_log").insert({
          user_id: referenceId,
          action: "persona_inquiry_failed",
          target_type: "verification_request",
          target_id: inquiryId,
          metadata: { event_type: eventType },
        });

        break;
      }

      case "inquiry.expired": {
        await supabase
          .from("verification_requests")
          .update({
            status: "expired",
            persona_inquiry_id: inquiryId,
          })
          .eq("profile_id", referenceId);

        await supabase
          .from("profiles")
          .update({ verification_status: "unverified" })
          .eq("id", referenceId);

        await supabase.from("audit_log").insert({
          user_id: referenceId,
          action: "persona_inquiry_expired",
          target_type: "verification_request",
          target_id: inquiryId,
          metadata: { event_type: eventType },
        });

        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }
  } catch (err) {
    console.error("Persona webhook processing error:", err);
    return NextResponse.json(
      { error: "Internal error processing webhook" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
