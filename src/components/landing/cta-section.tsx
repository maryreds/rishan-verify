"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CtaSection() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center max-w-3xl mx-auto"
      >
        <h2 className="text-3xl lg:text-5xl font-serif leading-tight">
          Ready to prove you&apos;re{" "}
          <span className="text-emerald-600 dark:text-emerald-400">
            the real deal
          </span>
          ?
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">
          Join hundreds of verified professionals who stand out from the crowd.
          It&apos;s free, fast, and your privacy is guaranteed.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-foreground rounded-full hover:opacity-90 transition-all"
          >
            Get Verified — It&apos;s Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
