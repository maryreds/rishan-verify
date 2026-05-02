"use client";

import { useState } from "react";
import { toast } from "sonner";

export function CheckWaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/check/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("You're on the list", {
          description: "We'll email you the moment it's live.",
        });
      } else {
        const { error } = await res.json().catch(() => ({}));
        toast.error("Couldn't add you to the list", {
          description: error || "Try again in a moment.",
        });
      }
    } catch {
      toast.error("Network error", { description: "Try again in a moment." });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 text-center">
        <span className="material-symbols-outlined text-primary text-3xl">
          mark_email_read
        </span>
        <p className="mt-2 font-semibold text-foreground">You&apos;re on the list.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll email you the moment the Authenticity Score goes live.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        required
        disabled={loading}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@work.com"
        className="flex-1 h-12 px-4 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={loading}
        className="h-12 px-6 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Adding…" : "Notify me"}
      </button>
    </form>
  );
}
