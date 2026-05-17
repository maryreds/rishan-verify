"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Plus,
  Loader2,
  Check,
  X,
  User,
  Mail,
  Send,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

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

const RELATIONSHIPS = [
  { value: "manager", label: "Manager" },
  { value: "colleague", label: "Colleague" },
  { value: "report", label: "Direct Report" },
  { value: "client", label: "Client" },
];

export default function VouchManagerClient({}: { userId: string }) {
  const [received, setReceived] = useState<Vouch[]>([]);
  const [given, setGiven] = useState<Vouch[]>([]);
  const [loading, setLoading] = useState(true);

  // Vouch-for-someone dialog (email-based)
  const [giveOpen, setGiveOpen] = useState(false);
  const [giveSubmitting, setGiveSubmitting] = useState(false);
  const [giveName, setGiveName] = useState("");
  const [giveEmail, setGiveEmail] = useState("");
  const [giveSkill, setGiveSkill] = useState("");
  const [giveMessage, setGiveMessage] = useState("");

  // Request-vouch dialog (asks someone to vouch for you)
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqTitle, setReqTitle] = useState("");
  const [reqCompany, setReqCompany] = useState("");
  const [reqRelationship, setReqRelationship] = useState("");

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

  function resetGiveForm() {
    setGiveName("");
    setGiveEmail("");
    setGiveSkill("");
    setGiveMessage("");
  }

  function resetRequestForm() {
    setReqName("");
    setReqEmail("");
    setReqTitle("");
    setReqCompany("");
    setReqRelationship("");
  }

  async function handleGive(e: React.FormEvent) {
    e.preventDefault();

    if (!giveEmail.trim() || !giveName.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!giveSkill.trim()) {
      toast.error("Please enter a skill");
      return;
    }

    setGiveSubmitting(true);
    try {
      const res = await fetch("/api/vouches/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucheeEmail: giveEmail.trim(),
          voucheeName: giveName.trim(),
          skill: giveSkill.trim(),
          message: giveMessage.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to vouch");
      }

      toast.success("Vouch sent!", {
        description: `An email with your vouch has been sent to ${giveName}`,
      });
      setGiveOpen(false);
      resetGiveForm();
      fetchVouches();
    } catch (err) {
      toast.error("Failed to send vouch", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setGiveSubmitting(false);
    }
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();

    if (!reqName.trim() || !reqEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setRequestSubmitting(true);
    try {
      const res = await fetch("/api/references/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reqName.trim(),
          email: reqEmail.trim(),
          title: reqTitle.trim() || null,
          company: reqCompany.trim() || null,
          relationship: reqRelationship || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to request vouch");
      }

      toast.success("Vouch request sent!", {
        description: `We emailed ${reqName} to vouch for you`,
      });
      setRequestOpen(false);
      resetRequestForm();
    } catch (err) {
      toast.error("Failed to send request", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setRequestSubmitting(false);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Peer Vouches</h1>
          <p className="text-muted-foreground">
            Vouch for peers and receive endorsements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRequestOpen(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Request Vouch
          </Button>
          <Button onClick={() => setGiveOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Vouch for Someone
          </Button>
        </div>
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
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                  Ask a colleague or manager to vouch for your skills — we&rsquo;ll
                  email them a quick form to fill out.
                </p>
                <Button onClick={() => setRequestOpen(true)} variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Request Your First Vouch
                </Button>
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
                <Button onClick={() => setGiveOpen(true)} variant="outline">
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

      {/* Vouch for Someone — email-based */}
      <Dialog
        open={giveOpen}
        onOpenChange={(open) => {
          setGiveOpen(open);
          if (!open) resetGiveForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vouch for Someone</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Enter their email and we&rsquo;ll send them your vouch directly.
            </p>
          </DialogHeader>
          <form onSubmit={handleGive} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="give-name">Full Name</Label>
              <Input
                id="give-name"
                required
                placeholder="Jane Smith"
                value={giveName}
                onChange={(e) => setGiveName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="give-email">Email</Label>
              <Input
                id="give-email"
                type="email"
                required
                placeholder="jane@company.com"
                value={giveEmail}
                onChange={(e) => setGiveEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="give-skill">Skill you&rsquo;re vouching for</Label>
              <Input
                id="give-skill"
                required
                placeholder="e.g. React, Leadership, System Design"
                value={giveSkill}
                onChange={(e) => setGiveSkill(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="give-message">Message (optional)</Label>
              <Textarea
                id="give-message"
                placeholder="Why are you vouching for this person?"
                rows={3}
                value={giveMessage}
                onChange={(e) => setGiveMessage(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setGiveOpen(false);
                  resetGiveForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={giveSubmitting}>
                {giveSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Vouch
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Request Vouch — ask someone to vouch for you */}
      <Dialog
        open={requestOpen}
        onOpenChange={(open) => {
          setRequestOpen(open);
          if (!open) resetRequestForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Vouch</DialogTitle>
            <p className="text-sm text-muted-foreground">
              We&rsquo;ll email them a short form asking for a few words and their role.
            </p>
          </DialogHeader>
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="req-name">Full Name</Label>
              <Input
                id="req-name"
                required
                placeholder="Jane Smith"
                value={reqName}
                onChange={(e) => setReqName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-email">Email</Label>
              <Input
                id="req-email"
                type="email"
                required
                placeholder="jane@company.com"
                value={reqEmail}
                onChange={(e) => setReqEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-title">Job Title</Label>
              <Input
                id="req-title"
                placeholder="Engineering Manager"
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-company">Company</Label>
              <Input
                id="req-company"
                placeholder="Acme Inc."
                value={reqCompany}
                onChange={(e) => setReqCompany(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Select value={reqRelationship} onValueChange={setReqRelationship}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRequestOpen(false);
                  resetRequestForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={requestSubmitting}>
                {requestSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
