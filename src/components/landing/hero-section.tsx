"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-20 lg:pt-20 lg:pb-32">
      <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: copy */}
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Recognized by top recruiters nationwide
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif leading-[1.1] tracking-tight"
          >
            Cut through the noise.{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              Get the verified badge.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg"
          >
            Don&apos;t let your resume get lost in a sea of automated
            applications. Earn a free, recruiter-trusted badge that verifies
            your identity and work authorization — instantly moving you to the
            top of the pile.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-foreground rounded-full hover:opacity-90 transition-all"
            >
              Get Verified for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium text-foreground bg-transparent border border-border rounded-full hover:bg-muted transition-all"
            >
              See how it works
            </Link>
          </motion.div>

          {/* Mini social proof */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-12 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[
                "photo-1494790108377-be9c29b29330",
                "photo-1507003211169-0a1dd7228f2d",
                "photo-1580489944761-15a19d654956",
                "photo-1438761681033-6461ffad8d80",
              ].map((id, i) => (
                <Image
                  key={i}
                  src={`https://images.unsplash.com/${id}?w=80&h=80&fit=crop&crop=face`}
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">
                Trusted by <span className="font-semibold text-foreground">500+</span> professionals
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right: hero badge card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative rounded-3xl overflow-hidden border border-border">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=900&fit=crop&crop=face"
              alt="Professional woman at work"
              width={800}
              height={900}
              className="w-full h-[500px] lg:h-[580px] object-cover"
              priority
            />
            {/* Dark gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 65%)",
              }}
            />
            {/* Name + VERIFIED chip */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Sofia Rivera
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 rounded text-[10px] font-black tracking-wider text-white">
                  ✓ VERIFIED
                </span>
              </div>
              <p className="text-sm text-white/60 mb-5 flex items-center gap-1.5">
                <span>Austin, TX</span>
                <span className="opacity-40">·</span>
                <span>UX / UI Designer</span>
              </p>
              {/* Identity Verified bar */}
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-black/50 backdrop-blur-md border border-white/10">
                <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-[18px] h-[18px] text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    Identity Verified
                  </p>
                  <p className="text-[10px] text-white/50 leading-tight mt-0.5">
                    Work authorization confirmed via government sources
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
