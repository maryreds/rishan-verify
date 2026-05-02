"use client";

import { useState } from "react";
import { toast } from "sonner";

interface BadgeActionsProps {
  profileUrl: string;
  candidateName: string;
  vouchScore?: number;
  isOwner?: boolean;
}

export function BadgeActions({
  profileUrl,
  candidateName,
  vouchScore,
  isOwner = false,
}: BadgeActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  // Pre-written share text — owner-friendly for self-promotion, third-party-friendly
  // for endorsement. The OG image at the URL becomes the visual.
  const shareText = isOwner
    ? `I just got Vouch Verified${
        vouchScore ? ` — Vouch Score ${vouchScore}` : ""
      }. Identity, work auth, references, and credentials all checked. Hire-ready.`
    : `${candidateName} is Vouch Verified${
        vouchScore ? ` — Vouch Score ${vouchScore}` : ""
      }. Pre-checked identity, references, and credentials.`;

  const shareUrl = profileUrl;

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`
  )}`;

  return (
    <div className="space-y-2">
      <button
        onClick={handleHire}
        className="w-full py-2.5 bg-white text-primary font-semibold rounded-xl text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-lg">person_add</span>
        Hire via Vouch
      </button>

      {/* Share row — three social buttons + copy link */}
      <div className="grid grid-cols-4 gap-2">
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className="py-2.5 bg-white/15 text-primary-foreground font-medium rounded-xl text-sm hover:bg-white/25 transition-colors flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.76.79 1.76 1.76-.79 1.76-1.76 1.76zm13.5 12.27h-3v-5.6c0-3.37-4-3.11-4 0v5.6h-3v-11h3v1.76c1.4-2.59 7-2.78 7 2.48v6.76z"/>
          </svg>
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className="py-2.5 bg-white/15 text-primary-foreground font-medium rounded-xl text-sm hover:bg-white/25 transition-colors flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          className="py-2.5 bg-white/15 text-primary-foreground font-medium rounded-xl text-sm hover:bg-white/25 transition-colors flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
        </a>
        <button
          onClick={handleCopyLink}
          aria-label="Copy profile link"
          className="py-2.5 bg-white/15 text-primary-foreground font-medium rounded-xl text-sm hover:bg-white/25 transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-lg">
            {copied ? "check" : "link"}
          </span>
        </button>
      </div>
    </div>
  );
}
