"use client";

import { useState } from "react";
import { toast } from "sonner";

interface BadgeActionsProps {
  profileUrl: string;
  candidateName: string;
}

export function BadgeActions({ profileUrl, candidateName }: BadgeActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = profileUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      toast.success("Profile link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleHire = () => {
    const subject = encodeURIComponent(`Interest in ${candidateName} via Vouch`);
    const body = encodeURIComponent(
      `Hi,\n\nI found ${candidateName}'s verified profile on Vouch and would like to express interest in this candidate.\n\nProfile: ${profileUrl}\n\nPlease get in touch to discuss next steps.\n\nBest regards`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleHire}
        className="w-full py-2.5 bg-white text-primary font-semibold rounded-xl text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-lg">person_add</span>
        Hire via Vouch
      </button>
      <button
        onClick={handleCopyLink}
        className="w-full py-2.5 bg-white/15 text-primary-foreground font-medium rounded-xl text-sm hover:bg-white/25 transition-colors flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-lg">
          {copied ? "check" : "link"}
        </span>
        {copied ? "Copied!" : "Copy Profile Link"}
      </button>
    </div>
  );
}
