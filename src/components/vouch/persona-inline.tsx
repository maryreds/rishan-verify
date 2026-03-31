"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PersonaInlineProps {
  /** Inquiry ID from the backend create-inquiry call */
  inquiryId: string;
  /** Session token from Persona */
  sessionToken: string;
  /** Whether this is a sandbox key */
  sandbox?: boolean;
  /** Called when user completes verification */
  onComplete?: (inquiryId: string, status: string) => void;
  /** Called when user cancels/exits before completing */
  onCancel?: () => void;
  /** Called on errors */
  onError?: (message: string) => void;
}

export default function PersonaInline({
  inquiryId,
  sessionToken,
  sandbox = false,
  onComplete,
  onCancel,
  onError,
}: PersonaInlineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  const handleComplete = useCallback(
    ({ inquiryId: id, status }: { inquiryId: string; status: string }) => {
      onComplete?.(id, status);
    },
    [onComplete]
  );

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const handleError = useCallback(
    (error: { message?: string; code: string }) => {
      const msg = error.message || "Verification encountered an error";
      toast.error("Verification error", { description: msg });
      onError?.(msg);
    },
    [onError]
  );

  useEffect(() => {
    if (!containerRef.current || clientRef.current) return;

    let destroyed = false;

    async function mount() {
      // Dynamic import to avoid SSR issues
      const Persona = (await import("persona")).default;

      if (destroyed || !containerRef.current) return;

      const container = containerRef.current;

      const client = new Persona.Client({
        inquiryId,
        sessionToken,
        ...(sandbox ? { environment: "sandbox" as const } : {}),
        parent: container,
        onReady: () => {
          // Force the SDK's overlay wrapper to display inline within our container
          const overlay = container.querySelector<HTMLElement>(
            ".persona-widget__overlay"
          );
          if (overlay) {
            overlay.style.display = "block";
            overlay.style.position = "relative";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
          }
          const iframe = container.querySelector<HTMLIFrameElement>(
            ".persona-widget__iframe"
          );
          if (iframe) {
            iframe.style.position = "relative";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
          }
          setLoading(false);
        },
        onComplete: handleComplete,
        onCancel: handleCancel,
        onError: handleError,
        frameWidth: "100%",
        frameHeight: "600px",
      });

      clientRef.current = client;
    }

    mount();

    return () => {
      destroyed = true;
      if (clientRef.current?.destroy) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
  }, [inquiryId, sessionToken, handleComplete, handleCancel, handleError]);

  return (
    <div className="relative w-full min-h-[600px] rounded-xl overflow-hidden border border-border">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">
            Loading verification...
          </p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-[600px] [&>iframe]:!w-full [&>iframe]:!h-full" />
    </div>
  );
}
