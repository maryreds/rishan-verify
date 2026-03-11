"use client";

import Image from "next/image";
import { Lock, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";

const photos = [
  { src: "photo-1551434678-e076c223a692", alt: "Team collaborating at work", h: "h-48" },
  { src: "photo-1580489944761-15a19d654956", alt: "Professional woman smiling", h: "h-60", crop: "&crop=face" },
  { src: "photo-1522071820081-009f0129c71c", alt: "Diverse team working together", h: "h-60" },
  { src: "photo-1600880292203-757bb62b4baf", alt: "Professional woman leading a meeting", h: "h-48" },
];

const features = [
  {
    icon: Lock,
    title: "Privacy-first design",
    desc: "Your passport photo is encrypted, accessed only by authorized reviewers, and permanently destroyed after verification.",
  },
  {
    icon: Zap,
    title: "Fast turnaround",
    desc: "Most verifications complete within 24 hours. No algorithms — a real human reviews your case.",
  },
  {
    icon: Globe,
    title: "Shareable anywhere",
    desc: "Get a unique public link to your verified profile. Add it to your resume, LinkedIn, or send directly to recruiters.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Photo grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            {[photos[0], photos[1]].map((p, i) => (
              <motion.div
                key={p.src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="rounded-2xl overflow-hidden border border-white/5"
              >
                <Image
                  src={`https://images.unsplash.com/${p.src}?w=600&h=500&fit=crop${p.crop || ""}`}
                  alt={p.alt}
                  width={600}
                  height={500}
                  className={`w-full ${p.h} object-cover`}
                />
              </motion.div>
            ))}
          </div>
          <div className="space-y-4 pt-8">
            {[photos[2], photos[3]].map((p, i) => (
              <motion.div
                key={p.src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: (i + 2) * 0.15, duration: 0.5 }}
                className="rounded-2xl overflow-hidden border border-white/5"
              >
                <Image
                  src={`https://images.unsplash.com/${p.src}?w=600&h=500&fit=crop${p.crop || ""}`}
                  alt={p.alt}
                  width={600}
                  height={500}
                  className={`w-full ${p.h} object-cover`}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
              Why Rishan Verify
            </span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold leading-tight">
              Built for real professionals
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                in a world of fakes
              </span>
            </h2>
            <p className="mt-5 text-slate-400 leading-relaxed">
              Recruiters waste hours vetting candidates who exaggerate — or
              fabricate — their credentials. Rishan Verify gives honest
              professionals a way to stand apart with a badge backed by
              human-reviewed identity verification.
            </p>
          </motion.div>

          <div className="mt-8 space-y-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mt-0.5">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{title}</h4>
                  <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
