"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  BadgeCheck,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VerificationRequestWithProfile {
  id: string;
  profile_id: string;
  status: string;
  document_path: string | null;
  created_at: string;
  result_notes: string | null;
  immigration_status: string | null;
  status_valid_until: string | null;
  reviewed_at: string | null;
  profiles: {
    full_name: string;
    email: string;
    headline: string | null;
    skills: string[];
    domains: string[];
    verification_status: string;
  };
}

export default function AdminClient({
  user,
  pendingRequests,
  completedRequests,
  stats,
}: {
  user: User;
  pendingRequests: VerificationRequestWithProfile[];
  completedRequests: VerificationRequestWithProfile[];
  stats: { totalCandidates: number; verified: number; pending: number };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    immigration_status: "",
    status_valid_until: "",
    result_notes: "",
  });
  const [processing, setProcessing] = useState(false);

  async function viewDocument(requestId: string, documentPath: string) {
    // Log the access
    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "view_document",
      target_type: "verification_request",
      target_id: requestId,
    });

    // Get signed URL
    const { data, error } = await supabase.storage
      .from("verification-docs")
      .createSignedUrl(documentPath, 300); // 5 min expiry

    if (error) {
      toast.error("Failed to load document", { description: error.message });
      return;
    }

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }

    // Mark as in_review
    await supabase
      .from("verification_requests")
      .update({ status: "in_review" })
      .eq("id", requestId);
  }

  async function approveVerification(request: VerificationRequestWithProfile) {
    setProcessing(true);

    try {
      const expiresAt = reviewForm.status_valid_until
        ? new Date(reviewForm.status_valid_until).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // Default 1 year

      // Update verification request
      const { error: reqError } = await supabase
        .from("verification_requests")
        .update({
          status: "completed",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          immigration_status: reviewForm.immigration_status,
          status_valid_until: reviewForm.status_valid_until || null,
          result_notes: reviewForm.result_notes,
        })
        .eq("id", request.id);

      if (reqError) throw reqError;

      // Update candidate profile
      await supabase
        .from("profiles")
        .update({
          verification_status: "verified",
          verified_at: new Date().toISOString(),
          verification_expires_at: expiresAt,
        })
        .eq("id", request.profile_id);

      // Delete passport photo
      if (request.document_path) {
        await supabase.storage
          .from("verification-docs")
          .remove([request.document_path]);

        await supabase
          .from("verification_requests")
          .update({ document_deleted_at: new Date().toISOString() })
          .eq("id", request.id);

        // Audit log
        await supabase.from("audit_log").insert({
          user_id: user.id,
          action: "delete_document",
          target_type: "verification_request",
          target_id: request.id,
          metadata: { reason: "verification_complete" },
        });
      }

      // Audit log
      await supabase.from("audit_log").insert({
        user_id: user.id,
        action: "approve_verification",
        target_type: "verification_request",
        target_id: request.id,
        metadata: {
          immigration_status: reviewForm.immigration_status,
        },
      });

      toast.success("Verification approved", {
        description: "Document has been securely deleted",
      });

      setActiveRequest(null);
      setReviewForm({ immigration_status: "", status_valid_until: "", result_notes: "" });
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Approval failed", { description: message });
    } finally {
      setProcessing(false);
    }
  }

  async function rejectVerification(request: VerificationRequestWithProfile) {
    setProcessing(true);

    try {
      const { error: reqError } = await supabase
        .from("verification_requests")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          result_notes: reviewForm.result_notes,
        })
        .eq("id", request.id);

      if (reqError) throw reqError;

      await supabase
        .from("profiles")
        .update({ verification_status: "rejected" })
        .eq("id", request.profile_id);

      // Delete passport photo
      if (request.document_path) {
        await supabase.storage
          .from("verification-docs")
          .remove([request.document_path]);

        await supabase
          .from("verification_requests")
          .update({ document_deleted_at: new Date().toISOString() })
          .eq("id", request.id);
      }

      await supabase.from("audit_log").insert({
        user_id: user.id,
        action: "reject_verification",
        target_type: "verification_request",
        target_id: request.id,
      });

      toast.success("Verification rejected", {
        description: "Document has been securely deleted",
      });

      setActiveRequest(null);
      setReviewForm({ immigration_status: "", status_valid_until: "", result_notes: "" });
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Rejection failed", { description: message });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCandidates}</p>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending queue */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Verification Queue ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground">No pending verification requests.</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <Card key={req.id} className="border shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{req.profiles.full_name}</p>
                        <p className="text-sm text-muted-foreground">{req.profiles.email}</p>
                        {req.profiles.headline && (
                          <p className="text-sm text-muted-foreground">{req.profiles.headline}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {new Date(req.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {req.document_path && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewDocument(req.id, req.document_path!)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View ID
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() =>
                            setActiveRequest(activeRequest === req.id ? null : req.id)
                          }
                        >
                          Review
                        </Button>
                      </div>
                    </div>

                    {/* Review form */}
                    {activeRequest === req.id && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Immigration Status</Label>
                              <Select
                                value={reviewForm.immigration_status}
                                onValueChange={(v) =>
                                  setReviewForm({ ...reviewForm, immigration_status: v })
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select immigration status..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="US Citizen">US Citizen</SelectItem>
                                  <SelectItem value="Green Card">Green Card / Permanent Resident</SelectItem>
                                  <SelectItem value="H-1B">H-1B Visa</SelectItem>
                                  <SelectItem value="H-4 EAD">H-4 EAD</SelectItem>
                                  <SelectItem value="L-1">L-1 Visa</SelectItem>
                                  <SelectItem value="L-2 EAD">L-2 EAD</SelectItem>
                                  <SelectItem value="F-1 OPT">F-1 OPT</SelectItem>
                                  <SelectItem value="F-1 CPT">F-1 CPT</SelectItem>
                                  <SelectItem value="F-1 STEM OPT">F-1 STEM OPT Extension</SelectItem>
                                  <SelectItem value="TN Visa">TN Visa</SelectItem>
                                  <SelectItem value="E-3">E-3 Visa</SelectItem>
                                  <SelectItem value="O-1">O-1 Visa</SelectItem>
                                  <SelectItem value="EAD Other">EAD (Other)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Status Valid Until</Label>
                              <Input
                                type="date"
                                value={reviewForm.status_valid_until}
                                onChange={(e) =>
                                  setReviewForm({
                                    ...reviewForm,
                                    status_valid_until: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                              value={reviewForm.result_notes}
                              onChange={(e) =>
                                setReviewForm({
                                  ...reviewForm,
                                  result_notes: e.target.value,
                                })
                              }
                              rows={2}
                              placeholder="Any notes about the verification..."
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => approveVerification(req)}
                              disabled={!reviewForm.immigration_status || processing}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {processing ? "Processing..." : "Approve & Delete Document"}
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => rejectVerification(req)}
                              disabled={processing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject & Delete Document
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently completed */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Completed</CardTitle>
        </CardHeader>
        <CardContent>
          {completedRequests.length === 0 ? (
            <p className="text-muted-foreground">No completed verifications yet.</p>
          ) : (
            <div className="space-y-1">
              {completedRequests.map((req, index) => (
                <div key={req.id}>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-sm">{req.profiles.full_name}</p>
                      <p className="text-xs text-muted-foreground">{req.profiles.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {req.immigration_status && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {req.immigration_status}
                        </span>
                      )}
                      {req.status === "completed" ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                          <CheckCircle className="h-3.5 w-3.5" /> Approved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-medium">
                          <XCircle className="h-3.5 w-3.5" /> Rejected
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {req.reviewed_at && new Date(req.reviewed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {index < completedRequests.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
