"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? "");
      setLoading(false);
    });
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-[var(--font-headline)] text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account and privacy.
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your sign-in details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </p>
            <p className="mt-1 text-base text-foreground">
              {loading ? "Loading…" : email || "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>
            Sign out of Vouch on this browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignOut}
            disabled={signingOut}
            variant="outline"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </CardContent>
      </Card>

      {/* Legal */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & legal</CardTitle>
          <CardDescription>
            How your data is handled and the rules for using Vouch.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/privacy"
            className="text-primary hover:underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/terms"
            className="text-primary hover:underline underline-offset-2"
          >
            Terms of Service
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/cookies"
            className="text-primary hover:underline underline-offset-2"
          >
            Cookie Policy
          </Link>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription>
            Permanently delete your Vouch account, profile, and verification
            records. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Self-serve deletion is coming soon. For now, email us and we will
            delete your account within 30 days, as required by GDPR and CCPA.
          </p>
          <a
            href={`mailto:hello@knomadic.io?subject=${encodeURIComponent(
              "Vouch account deletion request"
            )}&body=${encodeURIComponent(
              `Please delete the Vouch account associated with: ${email}\n\nThank you.`
            )}`}
            onClick={() => toast.message("Opening your email client…")}
            className="inline-flex items-center justify-center rounded-md border border-destructive/40 bg-background px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            Request account deletion
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
