"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
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

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "candidate";
  const refCode = searchParams.get("ref");
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!agreed) {
      toast.error("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      toast.error("Signup failed", { description: error.message });
      setLoading(false);
      return;
    }

    // Track referral if a code was provided
    if (refCode) {
      try {
        await fetch("/api/referrals/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: refCode }),
        });
      } catch {
        // Referral tracking is best-effort; don't block signup
      }
    }

    // Attempt to auto-login and redirect to onboarding
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Email confirmation is likely required — fall back to login flow
      toast.success("Account created!", {
        description: "Check your email for a confirmation link.",
      });
      router.push("/login");
    } else {
      toast.success("Welcome! Let's set up your profile.");
      router.push("/onboarding");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <VouchLogo size="lg" href="/" className="text-primary-foreground [&_svg]:text-primary-foreground" />
          <h2 className="mt-8 text-3xl font-bold tracking-tight">
            {role === "employer"
              ? "Find pre-verified talent"
              : "Get Vouch Verified"}
          </h2>
          <p className="mt-4 text-primary-foreground/80 text-lg">
            {role === "employer"
              ? "Access a marketplace of verified candidates with confirmed identities, skills, and work authorization."
              : "Interview-ready in 10 minutes. Build your verified profile, showcase your skills, and let employers come to you."}
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
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                {role === "employer"
                  ? "Start discovering verified talent"
                  : "Get Vouch Verified and stand out to employers"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-start gap-2">
                  <input
                    id="terms"
                    type="checkbox"
                    className="mt-1 size-4 rounded border-input accent-primary"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <label htmlFor="terms" className="text-xs text-muted-foreground">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="font-medium text-primary hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="font-medium text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    . I consent to Vouch collecting and verifying my
                    professional credentials.
                  </label>
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-medium text-primary hover:underline" href="/login">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
