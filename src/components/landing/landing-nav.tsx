"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto"
    >
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="w-7 h-7 text-blue-400" />
        <span className="text-lg font-bold tracking-tight">Rishan Verify</span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/preview-badge"
          className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          See Example
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-full hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-600/20"
        >
          Get Verified
        </Link>
      </div>
    </motion.nav>
  );
}
