"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function LandingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto"
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-emerald-500" />
        <span className="text-base font-semibold tracking-tight">
          Rishan
        </span>
        <span className="text-muted-foreground/40 select-none">——</span>
        <span className="text-base font-semibold tracking-tight">
          Verify
        </span>
      </div>

      {/* Center nav links */}
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Features
        </a>
        <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          How It Works
        </a>
        <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Testimonials
        </a>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/login"
          className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-foreground rounded-full hover:opacity-90 transition-all"
        >
          Get Verified
        </Link>
      </div>
    </motion.nav>
  );
}
