"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  Linkedin,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { VouchLogo } from "@/components/vouch/vouch-logo";

interface PublishedClientProps {
  firstName: string;
  slug: string;
}

// Public host. The /v/[slug] route already serves a polished OG image
// (see src/app/v/[slug]/opengraph-image.tsx) so LinkedIn unfurls work
// with no further work here.
const PUBLIC_HOST = "vouch-app-xi.vercel.app";

export default function PublishedClient({ firstName, slug }: PublishedClientProps) {
  const [copied, setCopied] = useState(false);

  const publicUrl = `${PUBLIC_HOST}/v/${slug}`;
  const fullUrl = `https://${publicUrl}`;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — try selecting the link manually.");
    }
  }

  // LinkedIn share intent — opens a new window with the URL prefilled.
  // The /v/[slug] page exposes proper OG meta + image so the unfurl is
  // already polished.
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    fullUrl
  )}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <VouchLogo size="sm" href="/" />
          <span className="text-xs text-muted-foreground font-medium">
            Profile published
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* ── Sparkle / confetti animation ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="relative">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>
              {/* Decorative sparkles */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute -top-2 -right-3"
              >
                <Sparkles className="w-4 h-4 text-primary/60" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="absolute -bottom-1 -left-4"
              >
                <Sparkles className="w-3 h-3 text-primary/50" />
              </motion.div>
            </div>
          </motion.div>

          {/* ── Headline ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              🎉 You&apos;re live, {firstName}.
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
              Your Vouch profile is published. Share it anywhere — and keep
              building toward the full 5-pillar badge.
            </p>
          </motion.div>

          {/* ── Public URL with copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="rounded-2xl border-2 border-primary/20 bg-card p-5 md:p-6 shadow-sm"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Your public URL
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 text-base md:text-lg font-medium text-primary truncate hover:underline underline-offset-4"
              >
                {publicUrl}
              </a>
              <button
                type="button"
                onClick={copyUrl}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy link
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* ── Three action cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="grid gap-4 md:grid-cols-3"
          >
            {/* Share to LinkedIn */}
            <a
              href={linkedInShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-md transition-all flex flex-col gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold text-foreground">
                  Share to LinkedIn
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Polished unfurl preview ready — your headline, photo, and
                  Vouch Score are baked into the OG image.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-1.5 transition-all">
                Open share dialog <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </a>

            {/* Request 3 references */}
            <Link
              href="/dashboard/references"
              className="group rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-md transition-all flex flex-col gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold text-foreground">
                  Request 3 references
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Adds the References pillar to your badge — takes 5 days.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-1.5 transition-all">
                Start request <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Get 3 peer vouches */}
            <Link
              href="/dashboard/vouches"
              className="group rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-md transition-all flex flex-col gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold text-foreground">
                  Get 3 peer vouches
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Adds the Vouches pillar — colleagues vouch in 1 click.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-1.5 transition-all">
                Invite colleagues <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* ── Dashboard link ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-center"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Or just go to my dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
