"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Upload, Loader2, Trash2, FileText, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AddressEntry {
  id: string;
  profile_id: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  document_date: string | null;
  document_type: string | null;
  verified_at: string;
  created_at: string;
}

function formatDocumentType(type: string | null): string {
  if (!type) return "Document";
  const labels: Record<string, string> = {
    utility_bill: "Utility Bill",
    lease: "Lease",
    bank_statement: "Bank Statement",
    other: "Other Document",
  };
  return labels[type] || type;
}

export function AddressHistory({ profileId }: { profileId: string }) {
  const supabase = createClient();
  const [entries, setEntries] = useState<AddressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchEntries = useCallback(async () => {
    const { data, error } = await supabase
      .from("address_history")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch address history:", error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  }, [profileId, supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Please upload an image (JPG, PNG) or PDF file.");
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("File too large. Maximum size is 10 MB.");
      return;
    }

    setParsing(true);

    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const res = await fetch("/api/address/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, profileId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse document");
      }

      toast.success("Address extracted", {
        description: data.city && data.state
          ? `Found: ${data.city}, ${data.state}`
          : "Address data saved.",
      });

      // Refresh the list
      await fetchEntries();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse document";
      toast.error("Parsing failed", { description: message });
    } finally {
      setParsing(false);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from("address_history")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete entry");
      return;
    }

    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Address entry deleted");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-uploaded
    e.target.value = "";
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-[var(--font-headline)] font-bold text-foreground text-lg">
            Address History
          </h3>
          <p className="text-xs text-muted-foreground">
            Upload a utility bill, lease, or bank statement to verify your address
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <label
        className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors overflow-hidden group ${
          dragOver
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary hover:bg-primary/5"
        } ${parsing ? "pointer-events-none opacity-60" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {parsing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm font-medium text-muted-foreground">
              Parsing document...
            </span>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-muted-foreground">
              Drag and drop or click to upload
            </span>
            <span className="text-xs text-muted-foreground/60 mt-1">
              JPG, PNG, or PDF. Max 10 MB.
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={handleFileInput}
          disabled={parsing}
          className="hidden"
        />
      </label>

      {/* Address History Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : entries.length > 0 ? (
        <div className="mt-6 space-y-0">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Verified Addresses
          </h4>
          <div className="relative">
            {/* Timeline line */}
            {entries.length > 1 && (
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
            )}

            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 relative">
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-1.5 w-[23px] flex-shrink-0 flex justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 bg-muted/50 rounded-lg px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {entry.city && entry.state
                            ? `${entry.city}, ${entry.state}`
                            : entry.street || "Address parsed"}
                        </p>
                        {entry.street && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {entry.street}
                            {entry.zip ? ` ${entry.zip}` : ""}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <FileText className="w-3 h-3" />
                            {formatDocumentType(entry.document_type)}
                          </span>
                          {entry.verified_at && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(entry.verified_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          No address history yet. Upload a document to get started.
        </p>
      )}
    </div>
  );
}
