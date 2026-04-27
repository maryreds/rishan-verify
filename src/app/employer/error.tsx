"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EmployerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Employer error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              The candidate marketplace is having trouble
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              We couldn&rsquo;t load candidates right now. Try again — most of
              the time this clears on retry.
            </p>
            {error.digest ? (
              <p className="text-xs text-muted-foreground/70 font-mono">
                ref: {error.digest}
              </p>
            ) : null}
            <div className="pt-2">
              <Button onClick={reset}>Try again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
