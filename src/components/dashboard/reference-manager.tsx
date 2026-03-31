"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Loader2,
  Clock,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";

interface Reference {
  id: string;
  profile_id: string;
  referee_name: string;
  referee_email: string;
  referee_title: string | null;
  referee_company: string | null;
  relationship: string | null;
  status: string;
  token: string;
  responses: Record<string, unknown> | null;
  submitted_at: string | null;
  created_at: string;
}

const RELATIONSHIPS = [
  { value: "manager", label: "Manager" },
  { value: "colleague", label: "Colleague" },
  { value: "report", label: "Direct Report" },
  { value: "client", label: "Client" },
];

export default function ReferenceManagerClient({
  userId,
}: {
  userId: string;
}) {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [relationship, setRelationship] = useState("");

  const fetchReferences = useCallback(async () => {
    try {
      const res = await fetch("/api/references");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReferences(data.references || []);
    } catch {
      toast.error("Failed to load references");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  function resetForm() {
    setName("");
    setEmail("");
    setTitle("");
    setCompany("");
    setRelationship("");
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/references/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, title, company, relationship }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to request reference");
      }

      toast.success("Reference request sent!", {
        description: `An email has been sent to ${name}`,
      });
      setDialogOpen(false);
      resetForm();
      fetchReferences();
    } catch (err) {
      toast.error("Failed to send request", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setSubmitting(false);
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
          <h1 className="text-2xl font-bold tracking-tight">References</h1>
          <p className="text-muted-foreground">
            Request and manage professional references
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Request Reference
        </Button>
      </div>

      {references.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No references yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              Request references from managers, colleagues, or clients to
              strengthen your profile.
            </p>
            <Button onClick={() => setDialogOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Request Your First Reference
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {references.map((ref) => (
            <Card key={ref.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {ref.referee_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {[ref.referee_title, ref.referee_company]
                          .filter(Boolean)
                          .join(" at ") || ref.referee_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {ref.relationship && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {ref.relationship}
                      </span>
                    )}
                    {ref.status === "pending" ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {ref.submitted_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(ref.submitted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Reference</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ref-name">Full Name</Label>
              <Input
                id="ref-name"
                required
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref-email">Email</Label>
              <Input
                id="ref-email"
                type="email"
                required
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref-title">Job Title</Label>
              <Input
                id="ref-title"
                placeholder="Engineering Manager"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref-company">Company</Label>
              <Input
                id="ref-company"
                placeholder="Acme Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Select value={relationship} onValueChange={setRelationship}>
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
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
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
