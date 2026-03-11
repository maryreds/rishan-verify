"use client";

import Image from "next/image";
import { Lock, Zap, Globe, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32 space-y-20">
      {/* Feature 1: For Candidates */}
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-full mb-4">
            FOR CANDIDATES
          </span>
          <h2 className="text-2xl lg:text-3xl font-serif leading-tight">
            Get a verified badge from your professional profile
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Your identity and work authorization are verified by real humans — not algorithms. Based on your credentials, you receive a trusted badge that recruiters recognize instantly.
          </p>
          <div className="mt-6 space-y-3">
            {[
              "Privacy-first — documents encrypted & destroyed after review",
              "Fast turnaround — most verifications complete within 24 hours",
              "Shareable anywhere — unique link for resumes and LinkedIn",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <a href="/signup" className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-foreground hover:opacity-70 transition-opacity">
            Get Verified
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 lg:p-8"
        >
          {/* Mock verified profile card */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"
                alt="Sofia Rivera"
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Sofia Rivera</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500 rounded text-[9px] font-bold text-white tracking-wide">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">UX / UI Designer · Austin, TX</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              {[
                { label: "Identity", status: "Verified" },
                { label: "Work Authorization", status: "Verified" },
                { label: "Background", status: "Verified" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature 2: For Recruiters */}
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 lg:p-8 order-2 lg:order-1"
        >
          {/* Mock recruiter dashboard card */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Recent Verified Candidates</h4>
            {[
              { name: "Marcus Thompson", role: "Lead Backend Engineer", photo: "photo-1507003211169-0a1dd7228f2d" },
              { name: "Aisha Davis", role: "Product Designer", photo: "photo-1580489944761-15a19d654956" },
              { name: "Arjun Patel", role: "Cloud Architect", photo: "photo-1519085360753-af0119f7cbe7" },
            ].map((person) => (
              <div key={person.name} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <Image
                  src={`https://images.unsplash.com/${person.photo}?w=64&h=64&fit=crop&crop=face`}
                  alt={person.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{person.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{person.role}</p>
                </div>
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  VERIFIED
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="order-1 lg:order-2"
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-full mb-4">
            FOR RECRUITERS
          </span>
          <h2 className="text-2xl lg:text-3xl font-serif leading-tight">
            Keep track of every verified candidate in one place
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            No more juggling spreadsheets or chasing references. See verified status at a glance, saving hours of manual background screening per hire.
          </p>
          <a href="/signup" className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-foreground hover:opacity-70 transition-opacity">
            Learn More
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
