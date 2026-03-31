"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  Copy,
  Check,
  Loader2,
  Mail,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Referral {
  id: string;
  referrer_id: string;
  referee_email: string;
  referee_id: string | null;
  referral_code: string;
  status: string;
  reward_amount: number | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "text-amber-600 border-amber-300 bg-amber-50",
  signed_up: "text-green-600 border-green-300 bg-green-50",
  rewarded: "text-primary border-primary/30 bg-primary/10",
};

export default function ReferralDashboardClient({
  userId,
}: {
  userId: string;
}) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchReferrals = useCallback(async () => {
    try {
      const res = await fetch("/api/referrals/list");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReferrals(data.referrals || []);
    } catch {
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const totalReferred = referrals.length;
  const signedUpCount = referrals.filter(
    (r) => r.status === "signed_up" || r.status === "rewarded"
  ).length;
  const pendingCount = referrals.filter(
    (r) => r.status === "pending"
  ).length;

  // Use the most recent referral code, or generate a placeholder
  const latestCode =
    referrals.length > 0 ? referrals[0].referral_code : null;

  function copyCode() {
    if (!latestCode) return;
    const url = `${window.location.origin}/signup?ref=${latestCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();

    if (!inviteEmail.trim()) return;

    setSending(true);

    try {
      const res = await fetch("/api/referrals/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send invite");
      }

      toast.success("Invite sent!", {
        description: `Referral email sent to ${inviteEmail}`,
      });
      setInviteEmail("");
      fetchReferrals();
    } catch (err) {
      toast.error("Failed to send invite", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground">
          Invite friends and earn rewards when they join Vouch
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalReferred}</p>
                <p className="text-sm text-muted-foreground">Total Referred</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{signedUpCount}</p>
                <p className="text-sm text-muted-foreground">Signed Up</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code + Invite */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {latestCode && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${latestCode}`}
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyCode}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this link with friends to earn referral rewards
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite by Email</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={sending} className="shrink-0">
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Referral List */}
      {referrals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <UserPlus className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No referrals yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Send an invite above to start referring friends to Vouch.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {referral.referee_email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Invited{" "}
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {referral.reward_amount && (
                      <span className="text-sm font-medium text-primary">
                        +${referral.reward_amount}
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        STATUS_STYLES[referral.status] || STATUS_STYLES.pending
                      }
                    >
                      {referral.status === "signed_up"
                        ? "Signed Up"
                        : referral.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
