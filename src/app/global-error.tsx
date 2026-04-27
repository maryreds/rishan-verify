"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#faf9f5",
          color: "#1b1c1a",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "440px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#265140",
              marginBottom: "16px",
            }}
          >
            ☑ Vouch
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 600,
              margin: "0 0 8px 0",
            }}
          >
            We couldn&rsquo;t load Vouch
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#414944",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            Something went wrong rendering the application shell. Please try
            again. If the problem persists, contact support.
          </p>
          {error.digest ? (
            <p
              style={{
                fontSize: "12px",
                color: "#6b7470",
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                marginBottom: "20px",
              }}
            >
              ref: {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#ffffff",
              background: "#265140",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
