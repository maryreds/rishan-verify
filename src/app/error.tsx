"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-fixed text-primary text-2xl font-semibold">
          !
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We hit an unexpected error loading this page. Try again, or head
            back to the homepage.
          </p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground/70 font-mono pt-2">
              ref: {error.digest}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
