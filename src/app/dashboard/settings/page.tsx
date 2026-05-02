"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const PUBLIC_BASE = "https://vouch-app-xi.vercel.app";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Slug state
  const [currentSlug, setCurrentSlug] = useState<string>("");
  const [slugInput, setSlugInput] = useState<string>("");
  const [savingSlug, setSavingSlug] = useState(false);

  // Notifications state
  const [notifyOnView, setNotifyOnView] = useState<boolean>(true);
  const [savingNotify, setSavingNotify] = useState(false);

  // Auth actions
  const [sendingReset, setSendingReset] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("vanity_slug, public_slug, notify_on_view")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      setEmail(user.email ?? "");
      setUserId(user.id);
      const slug =
        (profile?.vanity_slug as string | null) ||
        (profile?.public_slug as string | null) ||
        "";
      setCurrentSlug(slug);
      setSlugInput(slug);
      setNotifyOnView(
        profile?.notify_on_view === undefined || profile?.notify_on_view === null
          ? true
          : Boolean(profile.notify_on_view)
      );
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSendResetLink() {
    if (!email) return;
    setSendingReset(true);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });
    setSendingReset(false);
    if (error) {
      toast.error("Couldn't send reset link", { description: error.message });
      return;
    }
    toast.success("Reset link sent", {
      description: `Check ${email} for a password reset link.`,
    });
  }

  async function handleSaveSlug(e: React.FormEvent) {
    e.preventDefault();
    const next = slugInput.trim().toLowerCase();
    if (!next) {
      toast.error("Slug can't be empty");
      return;
    }
    if (next === currentSlug) {
      toast.message("That's already your slug");
      return;
    }

    setSavingSlug(true);
    const res = await fetch("/api/profile/change-slug", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: next }),
    });
    setSavingSlug(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error("Couldn't save slug", {
        description: body?.error || "Try again.",
      });
      return;
    }

    setCurrentSlug(next);
    setSlugInput(next);
    toast.success("Slug updated");
    router.refresh();
  }

  async function handleNotifyToggle(next: boolean) {
    if (!userId) return;
    setSavingNotify(true);
    setNotifyOnView(next);
    const { error } = await supabase
      .from("profiles")
      .update({ notify_on_view: next })
      .eq("id", userId);
    setSavingNotify(false);
    if (error) {
      // Roll back
      setNotifyOnView(!next);
      toast.error("Couldn't save preference", { description: error.message });
      return;
    }
    toast.success(
      next ? "We'll email you on new views." : "Email notifications off."
    );
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleDeleteAccount() {
    if (deleteConfirmEmail.trim().toLowerCase() !== email.toLowerCase()) {
      toast.error("Email doesn't match");
      return;
    }

    setDeleting(true);
    const res = await fetch("/api/profile/delete-account", {
      method: "POST",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setDeleting(false);
      toast.error("Couldn't delete account", {
        description: body?.error || "Try again or contact support.",
      });
      return;
    }

    // Belt-and-suspenders: also sign out client-side.
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }

    toast.success("Account deleted");
    router.push("/");
    router.refresh();
  }

  const previewSlug = slugInput.trim().toLowerCase() || currentSlug;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-[var(--font-headline)] text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account, profile, and notifications.
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your sign-in details and password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </p>
            <p className="mt-1 text-base text-foreground">
              {loading ? "Loading…" : email || "—"}
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Password
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll email you a secure link to set a new password.
            </p>
            <Button
              onClick={handleSendResetLink}
              disabled={sendingReset || !email}
              variant="outline"
              className="mt-3"
            >
              {sendingReset ? "Sending…" : "Send me a reset link"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Public profile */}
      <Card>
        <CardHeader>
          <CardTitle>Public profile</CardTitle>
          <CardDescription>
            Customize the link employers use to view you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSlug} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Vanity slug</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="text-sm text-muted-foreground sm:whitespace-nowrap">
                  vouch-app-xi.vercel.app/v/
                </span>
                <Input
                  id="slug"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  placeholder="your-name"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lowercase letters, digits, and hyphens. 3–32 characters.
              </p>
            </div>

            {previewSlug && (
              <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Preview: </span>
                <Link
                  href={`/v/${previewSlug}`}
                  target="_blank"
                  className="text-primary hover:underline font-medium break-all"
                >
                  {`${PUBLIC_BASE}/v/${previewSlug}`}
                </Link>
              </div>
            )}

            <Button
              type="submit"
              disabled={
                savingSlug || loading || slugInput.trim() === currentSlug
              }
            >
              {savingSlug ? "Saving…" : "Save slug"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Decide when Vouch should email you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-foreground">
                Email me when an employer views my profile.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                We&apos;ll send a single email per viewer per day.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyOnView}
              onClick={() => handleNotifyToggle(!notifyOnView)}
              disabled={savingNotify || loading}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ${
                notifyOnView ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  notifyOnView ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
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
      <div className="pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-destructive mb-3">
          Danger zone
        </h2>
        <Card className="border-destructive/40">
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

        <Card className="mt-4 border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Delete account</CardTitle>
            <CardDescription>
              Permanently delete your Vouch account, profile, verification
              records, and uploaded files. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteConfirmEmail("");
                setDeleteOpen(true);
              }}
              disabled={loading || !email}
            >
              Delete my account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete your Vouch account?
            </DialogTitle>
            <DialogDescription>
              This permanently removes your profile, verifications, references,
              and uploaded files. To confirm, type your email below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-email">Type {email} to confirm</Label>
            <Input
              id="confirm-email"
              value={deleteConfirmEmail}
              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
              placeholder={email}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={
                deleting ||
                deleteConfirmEmail.trim().toLowerCase() !==
                  email.toLowerCase()
              }
            >
              {deleting ? "Deleting…" : "Delete account permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
