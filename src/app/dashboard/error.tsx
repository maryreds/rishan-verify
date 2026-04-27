"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="p-6">
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            We couldn&rsquo;t load this section
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your dashboard data didn&rsquo;t come through. This is usually
            temporary — try again, and if it keeps happening let us know.
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
  );
}
