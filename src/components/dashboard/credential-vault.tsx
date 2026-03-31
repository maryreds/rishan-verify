"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Award,
  Plus,
  Trash2,
  Edit,
  Shield,
  ExternalLink,
  Loader2,
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
import { cn } from "@/lib/utils";

interface Credential {
  id: string;
  profile_id: string;
  name: string;
  issuer: string | null;
  credential_type: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_url: string | null;
  document_path: string | null;
  verified: boolean;
  created_at: string;
}

const CREDENTIAL_TYPES = [
  { value: "certification", label: "Certification" },
  { value: "degree", label: "Degree" },
  { value: "license", label: "License" },
  { value: "award", label: "Award" },
];

const EMPTY_FORM = {
  name: "",
  issuer: "",
  credential_type: "certification",
  issue_date: "",
  expiry_date: "",
  credential_url: "",
};

interface CredentialVaultClientProps {
  userId: string;
}

function getExpiryStatus(expiryDate: string | null): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} {
  if (!expiryDate) {
    return { label: "No Expiry", variant: "secondary", className: "" };
  }

  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntil = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntil < 0) {
    return {
      label: "Expired",
      variant: "destructive",
      className: "",
    };
  }
  if (daysUntil <= 30) {
    return {
      label: `Expires in ${daysUntil}d`,
      variant: "outline",
      className: "border-red-500 text-red-600 dark:text-red-400",
    };
  }
  if (daysUntil <= 90) {
    return {
      label: `Expires in ${daysUntil}d`,
      variant: "outline",
      className: "border-yellow-500 text-yellow-600 dark:text-yellow-400",
    };
  }
  return {
    label: `Valid until ${new Date(expiryDate).toLocaleDateString()}`,
    variant: "outline",
    className: "border-green-500 text-green-600 dark:text-green-400",
  };
}

export default function CredentialVaultClient({
  userId,
}: CredentialVaultClientProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/credentials");
      const data = await res.json();
      if (res.ok) {
        setCredentials(data.credentials || []);
      } else {
        toast.error("Failed to load credentials", { description: data.error });
      }
    } catch {
      toast.error("Failed to load credentials");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowDialog(true);
  }

  function openEdit(cred: Credential) {
    setEditingId(cred.id);
    setForm({
      name: cred.name,
      issuer: cred.issuer || "",
      credential_type: cred.credential_type || "certification",
      issue_date: cred.issue_date || "",
      expiry_date: cred.expiry_date || "",
      credential_url: cred.credential_url || "",
    });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      if (editingId) {
        const res = await fetch(`/api/credentials/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            issuer: form.issuer || null,
            credential_type: form.credential_type,
            issue_date: form.issue_date || null,
            expiry_date: form.expiry_date || null,
            credential_url: form.credential_url || null,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setCredentials(
            credentials.map((c) =>
              c.id === editingId ? data.credential : c
            )
          );
          toast.success("Credential updated");
          setShowDialog(false);
        } else {
          toast.error("Failed to update", { description: data.error });
        }
      } else {
        const res = await fetch("/api/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            issuer: form.issuer || null,
            credential_type: form.credential_type,
            issue_date: form.issue_date || null,
            expiry_date: form.expiry_date || null,
            credential_url: form.credential_url || null,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setCredentials([data.credential, ...credentials]);
          toast.success("Credential added");
          setShowDialog(false);
        } else {
          toast.error("Failed to add", { description: data.error });
        }
      }
    } catch {
      toast.error("Something went wrong");
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/credentials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCredentials(credentials.filter((c) => c.id !== id));
        toast.success("Credential removed");
      } else {
        const data = await res.json();
        toast.error("Failed to delete", { description: data.error });
      }
    } catch {
      toast.error("Failed to delete");
    }
    setDeletingId(null);
  }

  // Group credentials by type
  const grouped = CREDENTIAL_TYPES.map((type) => ({
    ...type,
    items: credentials.filter((c) => c.credential_type === type.value),
  })).filter((group) => group.items.length > 0);

  const typeLabel = (type: string) =>
    CREDENTIAL_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Credential Vault
          </h1>
          <p className="text-sm text-muted-foreground">
            Store and track your certifications, degrees, licenses, and awards.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Credential
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : credentials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No credentials yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Add your certifications, degrees, licenses, and awards to build
              trust with employers and boost your Vouch score.
            </p>
            <Button onClick={openAdd} variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Add Your First Credential
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <Card key={group.value}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  {group.label}s
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {group.items.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.items.map((cred) => {
                    const expiry = getExpiryStatus(cred.expiry_date);
                    return (
                      <div
                        key={cred.id}
                        className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-foreground">
                              {cred.name}
                            </p>
                            <Badge
                              variant={expiry.variant}
                              className={cn("text-xs", expiry.className)}
                            >
                              {expiry.label}
                            </Badge>
                            {cred.verified && (
                              <Badge
                                variant="default"
                                className="text-xs bg-green-600"
                              >
                                Verified
                              </Badge>
                            )}
                          </div>
                          {cred.issuer && (
                            <p className="text-sm text-muted-foreground">
                              Issued by {cred.issuer}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            {cred.issue_date && (
                              <p className="text-xs text-muted-foreground/60">
                                Issued:{" "}
                                {new Date(
                                  cred.issue_date
                                ).toLocaleDateString()}
                              </p>
                            )}
                            {cred.credential_url && (
                              <a
                                href={cred.credential_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(cred)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(cred.id)}
                            disabled={deletingId === cred.id}
                          >
                            {deletingId === cred.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Credential" : "Add Credential"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cred-name">Name *</Label>
              <Input
                id="cred-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="AWS Solutions Architect"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cred-issuer">Issuer</Label>
                <Input
                  id="cred-issuer"
                  value={form.issuer}
                  onChange={(e) =>
                    setForm({ ...form, issuer: e.target.value })
                  }
                  placeholder="Amazon Web Services"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cred-type">Type</Label>
                <Select
                  value={form.credential_type}
                  onValueChange={(val) =>
                    setForm({ ...form, credential_type: val })
                  }
                >
                  <SelectTrigger id="cred-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDENTIAL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cred-issue-date">Issue Date</Label>
                <Input
                  id="cred-issue-date"
                  type="date"
                  value={form.issue_date}
                  onChange={(e) =>
                    setForm({ ...form, issue_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cred-expiry-date">Expiry Date</Label>
                <Input
                  id="cred-expiry-date"
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) =>
                    setForm({ ...form, expiry_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cred-url">Credential URL</Label>
              <Input
                id="cred-url"
                type="url"
                value={form.credential_url}
                onChange={(e) =>
                  setForm({ ...form, credential_url: e.target.value })
                }
                placeholder="https://www.credly.com/badges/..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || saving}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Credential"
                  : "Add Credential"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
