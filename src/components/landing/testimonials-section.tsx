"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "I was tired of being lumped in with fake candidates. My Rishan badge finally lets recruiters see I'm the real deal.",
    name: "Priya Sharma",
    role: "Salesforce Developer",
    photo: "photo-1494790108377-be9c29b29330",
  },
  {
    quote:
      "The verification was fast and respectful — they took my privacy seriously. Now I share my badge on every application.",
    name: "Michael Chen",
    role: "Data Engineer",
    photo: "photo-1507003211169-0a1dd7228f2d",
  },
  {
    quote:
      "As a recruiter, I trust Rishan-verified candidates instantly. It saves me hours of background screening per hire.",
    name: "Sarah Williams",
    role: "Senior Recruiter",
    photo: "photo-1438761681033-6461ffad8d80",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-y border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl lg:text-4xl font-serif">
            Trusted by professionals
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.12,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="bg-card border border-border rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <p className="text-foreground/80 text-sm leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Image
                  src={`https://images.unsplash.com/${t.photo}?w=80&h=80&fit=crop&crop=face`}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
