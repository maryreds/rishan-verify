"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Vouch app error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-6">
          <span className="w-2 h-2 bg-destructive rounded-full" />
          Something broke
        </div>
        <h1 className="font-[var(--font-headline)] text-4xl sm:text-5xl font-black tracking-tight leading-tight">
          We&apos;re on it.
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          An unexpected error occurred. The team has been notified — try again or head back to your dashboard.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-muted-foreground/70 font-mono">
            ref {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-all shadow-lg"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-foreground border border-border rounded-full hover:bg-muted transition-all"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
