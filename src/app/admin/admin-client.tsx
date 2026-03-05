"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  BadgeCheck,
  Clock,
  LogOut,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

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

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function viewDocument(requestId: string, documentPath: string) {
    // Log the access
    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "view_document",
      target_type: "verification_request",
      target_id: requestId,
    });

    // Get signed URL
    const { data } = await supabase.storage
      .from("verification-docs")
      .createSignedUrl(documentPath, 300); // 5 min expiry

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

    const expiresAt = reviewForm.status_valid_until
      ? new Date(reviewForm.status_valid_until).toISOString()
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // Default 1 year

    // Update verification request
    await supabase
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

    setActiveRequest(null);
    setReviewForm({ immigration_status: "", status_valid_until: "", result_notes: "" });
    setProcessing(false);
    router.refresh();
  }

  async function rejectVerification(request: VerificationRequestWithProfile) {
    setProcessing(true);

    await supabase
      .from("verification_requests")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        result_notes: reviewForm.result_notes,
      })
      .eq("id", request.id);

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

    setActiveRequest(null);
    setReviewForm({ immigration_status: "", status_valid_until: "", result_notes: "" });
    setProcessing(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg">Rishan Verify</span>
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button onClick={handleSignOut} className="text-gray-400 hover:text-gray-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCandidates}</p>
                <p className="text-sm text-gray-500">Total Candidates</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <BadgeCheck className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-500">Pending Review</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending queue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Verification Queue ({pendingRequests.length})
          </h2>

          {pendingRequests.length === 0 ? (
            <p className="text-gray-500">No pending verification requests.</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{req.profiles.full_name}</p>
                      <p className="text-sm text-gray-500">{req.profiles.email}</p>
                      {req.profiles.headline && (
                        <p className="text-sm text-gray-600">{req.profiles.headline}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {new Date(req.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {req.document_path && (
                        <button
                          onClick={() => viewDocument(req.id, req.document_path!)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          <Eye className="w-4 h-4" /> View ID
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setActiveRequest(activeRequest === req.id ? null : req.id)
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Review
                      </button>
                    </div>
                  </div>

                  {/* Review form */}
                  {activeRequest === req.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Immigration Status
                          </label>
                          <select
                            value={reviewForm.immigration_status}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                immigration_status: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="">Select...</option>
                            <option value="US Citizen">US Citizen</option>
                            <option value="Green Card">Green Card / Permanent Resident</option>
                            <option value="H-1B">H-1B Visa</option>
                            <option value="H-4 EAD">H-4 EAD</option>
                            <option value="L-1">L-1 Visa</option>
                            <option value="L-2 EAD">L-2 EAD</option>
                            <option value="F-1 OPT">F-1 OPT</option>
                            <option value="F-1 CPT">F-1 CPT</option>
                            <option value="F-1 STEM OPT">F-1 STEM OPT Extension</option>
                            <option value="TN Visa">TN Visa</option>
                            <option value="E-3">E-3 Visa</option>
                            <option value="O-1">O-1 Visa</option>
                            <option value="EAD Other">EAD (Other)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status Valid Until
                          </label>
                          <input
                            type="date"
                            value={reviewForm.status_valid_until}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                status_valid_until: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={reviewForm.result_notes}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              result_notes: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Any notes about the verification..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => approveVerification(req)}
                          disabled={!reviewForm.immigration_status || processing}
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {processing ? "Processing..." : "Approve & Delete Document"}
                        </button>
                        <button
                          onClick={() => rejectVerification(req)}
                          disabled={processing}
                          className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject & Delete Document
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently completed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Recently Completed</h2>
          {completedRequests.length === 0 ? (
            <p className="text-gray-500">No completed verifications yet.</p>
          ) : (
            <div className="space-y-3">
              {completedRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{req.profiles.full_name}</p>
                    <p className="text-xs text-gray-500">{req.profiles.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {req.immigration_status && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {req.immigration_status}
                      </span>
                    )}
                    {req.status === "completed" ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {req.reviewed_at && new Date(req.reviewed_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
