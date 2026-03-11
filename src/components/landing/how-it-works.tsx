"use client";

import { Upload, UserCheck, Share2 } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Build your profile",
    desc: "Upload your resume and our AI extracts your experience, education, and skills — or add them manually.",
  },
  {
    step: "02",
    icon: UserCheck,
    title: "Verify your identity",
    desc: "Submit your ID for a human-reviewed verification. Your documents are encrypted and permanently destroyed after review.",
  },
  {
    step: "03",
    icon: Share2,
    title: "Share your badge",
    desc: "Get a unique verified profile link to share on resumes, LinkedIn, and with recruiters — instant proof of who you are.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32"
    >
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl lg:text-4xl font-serif">
            Three steps to a verified career
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Our human-reviewed verification process is fast, secure, and
            respected by employers across the staffing industry.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ step, icon: Icon, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.15,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="group relative bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-xs font-bold text-muted-foreground/50">
                {step}
              </span>
              <div className="mt-4 w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
