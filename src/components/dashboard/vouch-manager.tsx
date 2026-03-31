"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Plus,
  Loader2,
  Check,
  X,
  Search,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  full_name: string;
  photo_original_url: string | null;
}

interface Vouch {
  id: string;
  voucher_id: string;
  vouchee_id: string;
  skill: string;
  message: string | null;
  voucher_score: number;
  status: string;
  created_at: string;
  voucher?: Profile;
  vouchee?: Profile;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "text-amber-600 border-amber-300 bg-amber-50",
  accepted: "text-green-600 border-green-300 bg-green-50",
  rejected: "text-red-600 border-red-300 bg-red-50",
};

export default function VouchManagerClient({
  userId,
}: {
  userId: string;
}) {
  const [received, setReceived] = useState<Vouch[]>([]);
  const [given, setGiven] = useState<Vouch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Vouch form state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Profile | null>(
    null
  );
  const [skill, setSkill] = useState("");
  const [message, setMessage] = useState("");

  const fetchVouches = useCallback(async () => {
    try {
      const res = await fetch("/api/vouches/list");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReceived(data.received || []);
      setGiven(data.given || []);
    } catch {
      toast.error("Failed to load vouches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouches();
  }, [fetchVouches]);

  // Search for candidates by name
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/vouches/list?search=${encodeURIComponent(searchQuery)}`
        );
        // Use a simple Supabase query via a dedicated search
        const { createClient } = await import("@/lib/supabase");
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, photo_original_url")
          .ilike("full_name", `%${searchQuery}%`)
          .neq("id", userId)
          .limit(5);
        setSearchResults(data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, userId]);

  function resetForm() {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedCandidate(null);
    setSkill("");
    setMessage("");
  }

  async function handleVouch(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }

    if (!skill.trim()) {
      toast.error("Please enter a skill");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/vouches/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucheeId: selectedCandidate.id,
          skill: skill.trim(),
          message: message.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to vouch");
      }

      toast.success("Vouch sent!", {
        description: `You vouched for ${selectedCandidate.full_name}`,
      });
      setDialogOpen(false);
      resetForm();
      fetchVouches();
    } catch (err) {
      toast.error("Failed to send vouch", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRespond(vouchId: string, action: "accept" | "reject") {
    try {
      const res = await fetch("/api/vouches/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vouchId, action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to respond");
      }

      toast.success(action === "accept" ? "Vouch accepted!" : "Vouch rejected");
      fetchVouches();
    } catch (err) {
      toast.error("Failed to respond", {
        description: err instanceof Error ? err.message : "Please try again",
      });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Peer Vouches</h1>
          <p className="text-muted-foreground">
            Vouch for peers and receive endorsements
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Vouch for Someone
        </Button>
      </div>

      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">
            Received ({received.length})
          </TabsTrigger>
          <TabsTrigger value="given">Given ({given.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-4">
          {received.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No vouches received yet
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  When verified professionals vouch for your skills, they will
                  appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {received.map((vouch) => (
                <Card key={vouch.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {vouch.voucher?.photo_original_url ? (
                          <img
                            src={vouch.voucher.photo_original_url}
                            alt={vouch.voucher.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">
                            {vouch.voucher?.full_name || "Unknown"}
                          </p>
                          {vouch.message && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {vouch.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{vouch.skill}</Badge>
                        <Badge
                          variant="outline"
                          className={
                            STATUS_STYLES[vouch.status] || STATUS_STYLES.pending
                          }
                        >
                          {vouch.status}
                        </Badge>
                        {vouch.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() =>
                                handleRespond(vouch.id, "accept")
                              }
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() =>
                                handleRespond(vouch.id, "reject")
                              }
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="given" className="mt-4">
          {given.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No vouches given yet
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                  Vouch for colleagues and peers to help them stand out.
                </p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Vouch for Someone
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {given.map((vouch) => (
                <Card key={vouch.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {vouch.vouchee?.photo_original_url ? (
                          <img
                            src={vouch.vouchee.photo_original_url}
                            alt={vouch.vouchee.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">
                            {vouch.vouchee?.full_name || "Unknown"}
                          </p>
                          {vouch.message && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {vouch.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{vouch.skill}</Badge>
                        <Badge
                          variant="outline"
                          className={
                            STATUS_STYLES[vouch.status] || STATUS_STYLES.pending
                          }
                        >
                          {vouch.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vouch for Someone</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVouch} className="space-y-4">
            <div className="space-y-2">
              <Label>Find a Candidate</Label>
              {selectedCandidate ? (
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {selectedCandidate.full_name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedCandidate(null);
                      setSearchQuery("");
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  {(searchResults.length > 0 || searching) && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden">
                      {searching ? (
                        <div className="p-3 text-center text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                          Searching...
                        </div>
                      ) : (
                        searchResults.map((profile) => (
                          <button
                            key={profile.id}
                            type="button"
                            className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted transition-colors text-sm"
                            onClick={() => {
                              setSelectedCandidate(profile);
                              setSearchQuery("");
                              setSearchResults([]);
                            }}
                          >
                            {profile.photo_original_url ? (
                              <img
                                src={profile.photo_original_url}
                                alt={profile.full_name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <User className="w-3 h-3 text-muted-foreground" />
                              </div>
                            )}
                            {profile.full_name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vouch-skill">Skill</Label>
              <Input
                id="vouch-skill"
                required
                placeholder="e.g. React, Leadership, System Design"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vouch-message">Message (optional)</Label>
              <Textarea
                id="vouch-message"
                placeholder="Why are you vouching for this person?"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !selectedCandidate}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send Vouch"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
