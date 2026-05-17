"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_KEY = "vouch_session_token";
const VISITOR_KEY = "vouch_visitor_id";
const HEARTBEAT_MS = 15_000;

function getOrCreateSessionToken(): string {
  let token = sessionStorage.getItem(SESSION_KEY);
  if (!token) {
    token =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, token);
  }
  return token;
}

function getOrPersistVisitorId(searchParams: URLSearchParams): string | null {
  const fromUrl = searchParams.get("v");
  if (fromUrl) {
    localStorage.setItem(VISITOR_KEY, fromUrl);
    return fromUrl;
  }
  return localStorage.getItem(VISITOR_KEY);
}

function TrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewIdRef = useRef<string | null>(null);
  const sessionTokenRef = useRef<string>("");

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    const sessionToken = getOrCreateSessionToken();
    sessionTokenRef.current = sessionToken;
    const visitorId = getOrPersistVisitorId(
      new URLSearchParams(searchParams?.toString() ?? "")
    );

    let cancelled = false;
    fetch("/api/track/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionToken,
        visitorId,
        path: pathname,
        referrer: document.referrer || null,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) viewIdRef.current = data?.viewId ?? null;
      })
      .catch(() => {});

    const beat = () => {
      if (document.visibilityState !== "visible") return;
      const viewId = viewIdRef.current;
      if (!viewId) return;
      fetch("/api/track/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, viewId }),
        keepalive: true,
      }).catch(() => {});
    };

    const interval = setInterval(beat, HEARTBEAT_MS);
    const onVisibility = () => beat();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", beat);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", beat);
      beat();
    };
  }, [pathname, searchParams]);

  return null;
}

export default function VisitTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
