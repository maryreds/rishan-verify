import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "dashboard",
  "login",
  "signup",
  "onboarding",
  "employer",
  "auth",
  "check",
  "privacy",
  "terms",
  "cookies",
  "reset-password",
  "forgot-password",
  "v",
  "reference",
]);

const SLUG_RE = /^[a-z0-9-]+$/;

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const body = await request.json().catch(() => null);
    const rawSlug = body?.slug;

    if (typeof rawSlug !== "string") {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const slug = rawSlug.trim().toLowerCase();

    if (slug.length < 3 || slug.length > 32) {
      return NextResponse.json(
        { error: "Slug must be 3 to 32 characters." },
        { status: 400 }
      );
    }

    if (!SLUG_RE.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Slug can only contain lowercase letters, digits, and hyphens.",
        },
        { status: 400 }
      );
    }

    if (slug.startsWith("-") || slug.endsWith("-")) {
      return NextResponse.json(
        { error: "Slug can't start or end with a hyphen." },
        { status: 400 }
      );
    }

    if (RESERVED_SLUGS.has(slug)) {
      return NextResponse.json(
        { error: "That slug is reserved. Pick another." },
        { status: 400 }
      );
    }

    // Pre-check uniqueness (a UNIQUE constraint exists, but we want a friendly
    // error rather than a raw DB error message).
    const { data: existing, error: checkError } = await auth.supabase
      .from("profiles")
      .select("id")
      .or(`vanity_slug.eq.${slug},public_slug.eq.${slug}`)
      .neq("id", auth.userId)
      .limit(1);

    if (checkError) {
      console.error("Slug uniqueness check failed:", checkError);
      return NextResponse.json(
        { error: "Couldn't validate slug right now. Try again." },
        { status: 500 }
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "That slug is taken. Pick another." },
        { status: 409 }
      );
    }

    const { error: updateError } = await auth.supabase
      .from("profiles")
      .update({ vanity_slug: slug, public_slug: slug })
      .eq("id", auth.userId);

    if (updateError) {
      // Catch race-condition unique violation
      if (
        updateError.code === "23505" ||
        /unique/i.test(updateError.message || "")
      ) {
        return NextResponse.json(
          { error: "That slug is taken. Pick another." },
          { status: 409 }
        );
      }
      console.error("Slug update failed:", updateError);
      return NextResponse.json(
        { error: "Couldn't update slug. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, slug });
  } catch (error) {
    console.error("change-slug error:", error);
    return NextResponse.json(
      { error: "Failed to change slug" },
      { status: 500 }
    );
  }
}
