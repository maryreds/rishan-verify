"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Admin console error
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              The verification queue or admin data didn&rsquo;t load. Retry, or
              check the server logs if this persists.
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
