"use client";

import { Upload, UserCheck, Share2 } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Build your profile",
    desc: "Upload your resume and our AI extracts your experience, education, and skills — or add them manually.",
    gradient: "from-blue-600/20 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    step: "02",
    icon: UserCheck,
    title: "Verify your identity",
    desc: "Submit your ID for a human-reviewed verification. Your documents are encrypted and permanently destroyed after review.",
    gradient: "from-violet-600/20 to-violet-600/5",
    iconColor: "text-violet-400",
  },
  {
    step: "03",
    icon: Share2,
    title: "Share your badge",
    desc: "Get a unique verified profile link to share on resumes, LinkedIn, and with recruiters — instant proof of who you are.",
    gradient: "from-emerald-600/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32"
    >
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl lg:text-4xl font-bold">
            Three steps to a{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              verified career
            </span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Our human-reviewed verification process is fast, secure, and
            respected by employers across the staffing industry.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(
            ({ step, icon: Icon, title, desc, gradient, iconColor }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: i * 0.15,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative bg-gradient-to-b border border-white/5 rounded-2xl p-8 hover:border-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                }}
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
                <div className="relative z-10">
                  <span className="text-xs font-bold text-slate-600">
                    {step}
                  </span>
                  <div className="mt-4 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </motion.div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
