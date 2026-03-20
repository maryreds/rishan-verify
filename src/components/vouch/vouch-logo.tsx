"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VouchLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const sizes = {
  sm: { icon: "w-5 h-5", text: "text-sm" },
  md: { icon: "w-6 h-6", text: "text-base" },
  lg: { icon: "w-8 h-8", text: "text-xl" },
};

export function VouchLogo({ size = "md", href = "/", className }: VouchLogoProps) {
  const s = sizes[size];

  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <ShieldCheck className={cn(s.icon, "text-primary")} />
      <span className={cn(s.text, "font-bold tracking-tight")}>Vouch</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
