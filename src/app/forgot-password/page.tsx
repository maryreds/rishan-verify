"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { VouchLogo } from "@/components/vouch/vouch-logo";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      toast.error("Couldn't send reset link", { description: error.message });
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <VouchLogo
            size="lg"
            href="/"
            className="text-primary-foreground [&_svg]:text-primary-foreground"
          />
          <h2 className="mt-8 text-3xl font-bold tracking-tight">
            Reset your password
          </h2>
          <p className="mt-4 text-primary-foreground/80 text-lg">
            Enter your email and we&apos;ll send you a secure link to set a new
            password.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <VouchLogo size="lg" href="/" />
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {sent ? "Check your inbox" : "Forgot password"}
              </CardTitle>
              <CardDescription>
                {sent
                  ? "We sent a password reset link to your email."
                  : "We'll email you a link to reset your password."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Check your inbox — we sent a password reset link to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                    .
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Didn&apos;t receive it? Check spam, or{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                      onClick={() => setSent(false)}
                    >
                      try again
                    </button>
                    .
                  </p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send reset link"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              href="/login"
            >
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
