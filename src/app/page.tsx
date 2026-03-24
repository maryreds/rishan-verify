"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Upload,
  Sparkles,
  BadgeCheck,
  TrendingDown,
  Scale,
} from "lucide-react";
import { VouchLogo } from "@/components/vouch/vouch-logo";

const verifiedCandidates = [
  { name: "Rachel Williams", role: "Frontend Developer", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&h=400&fit=crop&crop=face" },
  { name: "Marcus Thompson", role: "Lead Backend Engineer", img: "https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?w=320&h=400&fit=crop&crop=face" },
  { name: "Aisha Davis", role: "Product Designer", img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=320&h=400&fit=crop&crop=face" },
  { name: "Jenny Liu", role: "Data Scientist", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&h=400&fit=crop&crop=face" },
  { name: "Sofia Rivera", role: "UX / UI Designer", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=320&h=400&fit=crop&crop=face" },
  { name: "Imani Carter", role: "DevSecOps Engineer", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=320&h=400&fit=crop&crop=face" },
  { name: "Arjun Patel", role: "Cloud Architect", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=320&h=400&fit=crop&crop=face" },
  { name: "Ryan Mitchell", role: "ML Engineer", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=320&h=400&fit=crop&crop=face" },
  { name: "James O'Brien", role: "Site Reliability Eng.", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=320&h=400&fit=crop&crop=face" },
  { name: "Natalia Gomez", role: "Engineering Manager", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=320&h=400&fit=crop&crop=face" },
  { name: "Priya Sharma", role: "Sr. DevOps Engineer", img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=320&h=400&fit=crop&crop=face" },
  { name: "Kevin Park", role: "Solutions Architect", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=320&h=400&fit=crop&crop=face" },
  { name: "Emma Scott", role: "Product Manager", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&h=400&fit=crop&crop=face" },
  { name: "Vikram Nair", role: "Full-Stack Engineer", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=320&h=400&fit=crop&crop=face" },
];

const marqueeImages = verifiedCandidates.map((c) => c.img);
const duplicatedImages = [...marqueeImages, ...marqueeImages];

const FADE_IN = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
        <VouchLogo size="md" href="/" />
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#employers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Employers</a>
          <Link href="/employer/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/login">
            Log In
          </Link>
          <Link className="px-5 py-2.5 text-sm font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all" href="/signup">
            Get Vouched
          </Link>
        </div>
      </nav>

      {/* Hero — Centered with marquee */}
      <section className="relative w-full min-h-[100vh] overflow-hidden flex flex-col items-start justify-start text-center px-4 pt-12 lg:pt-20 pb-0">
        <div className="z-20 flex flex-col items-center w-full relative">
          {/* Tagline */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={FADE_IN}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Trusted by 500+ verified professionals
          </motion.div>

          {/* Fox Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.15 }}
            className="mb-4 w-full max-w-[160px] sm:max-w-[200px] md:max-w-[240px] mx-auto"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto rounded-2xl"
            >
              <source src="/fox-vouch.mp4" type="video/mp4" />
            </video>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
            className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground"
          >
            {["Stop", "applying."].map((word, i) => (
              <motion.span key={i} variants={FADE_IN} className="inline-block">
                {word}&nbsp;
              </motion.span>
            ))}
            <br className="hidden sm:block" />
            {["Start", "getting"].map((word, i) => (
              <motion.span key={i + 2} variants={FADE_IN} className="inline-block text-primary">
                {word}&nbsp;
              </motion.span>
            ))}
            <motion.span variants={FADE_IN} className="inline-block text-primary">
              selected.
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial="hidden"
            animate="show"
            variants={FADE_IN}
            transition={{ delay: 0.5 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            Build your Vouch Profile in 10 minutes. Verify your identity,
            showcase your skills, and let employers come to you.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={FADE_IN}
            transition={{ delay: 0.6 }}
            className="mt-8 mb-16 md:mb-24 flex flex-col sm:flex-row gap-4"
          >
            <Link
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all shadow-lg"
              href="/signup?role=candidate"
            >
              I&apos;m a candidate
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-foreground bg-transparent border border-border rounded-full hover:bg-muted transition-all"
              href="/signup?role=employer"
            >
              I&apos;m hiring
            </Link>
          </motion.div>
        </div>

        {/* Animated Image Marquee */}
        <div className="absolute bottom-0 left-0 w-full h-[16%] md:h-[18%] pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, transparent, black 30%, black 80%, transparent)" }}>
          <motion.div
            className="flex gap-4"
            animate={{
              x: ["-50%", "0%"],
            }}
            transition={{
              ease: "linear",
              duration: 40,
              repeat: Infinity,
            }}
          >
            {duplicatedImages.map((src, index) => (
              <div
                key={index}
                className="relative aspect-[3/4] h-48 md:h-64 flex-shrink-0"
                style={{ rotate: `${index % 2 === 0 ? -2 : 5}deg` }}
              >
                <img
                  src={src}
                  alt={`Verified professional ${(index % verifiedCandidates.length) + 1}`}
                  className="w-full h-full object-cover rounded-2xl shadow-md"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary rounded px-1.5 py-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-primary-foreground" />
                  <span className="text-[7px] font-bold text-primary-foreground tracking-wide">VOUCHED</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Interview-ready in 10 minutes
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Build your verified profile. Let AI do the heavy lifting.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "1. Upload Your Resume",
                desc: "Our AI extracts your experience, education, and skills automatically and builds your Vouch Profile.",
              },
              {
                icon: Sparkles,
                title: "2. Get Your Vouch Score",
                desc: "Complete verifications and fill out your profile to boost your Vouch Score — the higher the score, the more employers see you.",
              },
              {
                icon: BadgeCheck,
                title: "3. Get Discovered",
                desc: "Verified candidates appear first in employer searches. Share your Vouch Profile link anywhere.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                variants={fadeUp}
                className="text-center p-8 rounded-2xl border border-border bg-card"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Employer Value Proposition */}
      <section id="employers" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              For Employers &amp; Staffing Firms
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop wasting days on verification. Start hiring pre-verified talent.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Instant Verification",
                desc: "Every candidate is pre-verified across identity, work authorization, background, and credentials. No more waiting 2-5 days.",
              },
              {
                icon: TrendingDown,
                title: "Reduce Costs",
                desc: "Cut verification costs by up to 70%. No more paying $60\u2013$180 per background check on candidates who don\u2019t work out.",
              },
              {
                icon: Scale,
                title: "Compliance Built In",
                desc: "I-9 compliance, work authorization tracking, and audit-ready verification records. Avoid $28,619 per-violation penalties.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                variants={fadeUp}
                className="p-8 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={4}
            variants={fadeUp}
            className="mt-12 text-center"
          >
            <Link
              href="/employer/marketplace"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all shadow-lg"
            >
              Browse Verified Candidates
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Free for candidates. Simple plans for employers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="flex flex-col p-8 rounded-2xl border border-border bg-card">
              <h3 className="text-lg font-semibold">Starter</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8 flex-1">
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" /> 50 searches/mo</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" /> Basic filters</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" /> Email support</li>
              </ul>
              <Link
                href="/employer/billing"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border border-border rounded-full hover:bg-muted transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Professional */}
            <div className="relative flex flex-col p-8 rounded-2xl border-2 border-primary bg-card shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                Most Popular
              </span>
              <h3 className="text-lg font-semibold">Professional</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">$499</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8 flex-1">
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" /> Unlimited searches</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" /> Advanced filters</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" /> Saved candidates</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" /> Priority support</li>
              </ul>
              <Link
                href="/employer/billing"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Enterprise */}
            <div className="flex flex-col p-8 rounded-2xl border border-border bg-card">
              <h3 className="text-lg font-semibold">Enterprise</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8 flex-1">
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" /> Everything in Pro</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" /> API access</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" /> Bulk verification</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" /> Dedicated support</li>
              </ul>
              <Link
                href="/employer/billing"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border border-border rounded-full hover:bg-muted transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
            Ready to get Vouched?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join 500+ professionals who have built their Vouch Profile and are
            getting discovered by top employers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all"
              href="/signup?role=candidate"
            >
              I&apos;m a candidate
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-foreground border border-border rounded-full hover:bg-muted transition-all"
              href="/signup?role=employer"
            >
              I&apos;m hiring
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <VouchLogo size="sm" href="/" />
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Vouch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
