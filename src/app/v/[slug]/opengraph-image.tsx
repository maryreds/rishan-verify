import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const alt = "Vouch Verified Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLOR_BG = "#faf9f5";
const COLOR_PRIMARY = "#265140";
const COLOR_PRIMARY_DIM = "#3e6957";
const COLOR_FG = "#1b1c1a";
const COLOR_MUTED = "#6B6560";

export default async function OpengraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();

  // Same allowlist as the page — never expose private fields in OG either
  const cols =
    "full_name, headline, location, photo_original_url, vouch_score, verification_status, vanity_slug, public_slug";

  let { data: profile } = await supabase
    .from("profiles")
    .select(cols)
    .eq("vanity_slug", params.slug)
    .single();

  if (!profile) {
    const { data: fallback } = await supabase
      .from("profiles")
      .select(cols)
      .eq("public_slug", params.slug)
      .single();
    profile = fallback;
  }

  const fullName = profile?.full_name || "Vouch member";
  const headline = profile?.headline || "Verified candidate";
  const location = profile?.location || "";
  const score = profile?.vouch_score ?? 0;
  const isVerified = profile?.verification_status === "verified";
  const photo = profile?.photo_original_url || null;
  const initial = fullName.charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: COLOR_BG,
          padding: "72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          color: COLOR_FG,
        }}
      >
        {/* Top row: logo + verification chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "32px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: COLOR_PRIMARY,
            }}
          >
            ☑ Vouch
          </div>
          {isVerified && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: COLOR_PRIMARY,
                color: "#ffffff",
                padding: "12px 22px",
                borderRadius: "999px",
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              ✓ Verified
            </div>
          )}
        </div>

        {/* Spacer */}
        <div style={{ display: "flex", flex: 1 }} />

        {/* Hero row */}
        <div style={{ display: "flex", alignItems: "center", gap: "48px" }}>
          {photo ? (
            <img
              src={photo}
              alt={fullName}
              width={220}
              height={220}
              style={{
                width: 220,
                height: 220,
                borderRadius: 9999,
                objectFit: "cover",
                border: `8px solid ${COLOR_PRIMARY}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 220,
                height: 220,
                borderRadius: 9999,
                background: COLOR_PRIMARY,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 110,
                fontWeight: 800,
              }}
            >
              {initial}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 76,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: COLOR_FG,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {fullName}
            </div>
            <div
              style={{
                fontSize: 32,
                color: COLOR_MUTED,
                fontWeight: 500,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {headline}
              {location ? ` · ${location}` : ""}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ display: "flex", flex: 1 }} />

        {/* Bottom row: score + CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${COLOR_PRIMARY_DIM}33`,
            paddingTop: "32px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{
                fontSize: 22,
                color: COLOR_MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              Vouch Score
            </div>
            <div
              style={{
                fontSize: 88,
                fontWeight: 800,
                color: COLOR_PRIMARY,
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              {score}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: COLOR_MUTED,
                fontWeight: 600,
              }}
            >
              Hire trust, not résumés.
            </div>
            <div
              style={{
                fontSize: 28,
                color: COLOR_FG,
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              vouch-app-xi.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
