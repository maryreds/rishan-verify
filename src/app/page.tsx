"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const FADE_IN = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

function MaterialIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  );
}

const testimonials = [
  {
    quote:
      "Vouch completely transformed my job search. I got three interview requests within a week of being verified.",
    name: "Sarah Chen",
    initials: "SC",
    title: "Senior Frontend Developer",
  },
  {
    quote:
      "As a hiring manager, the pre-verified talent pool saves us days of back-and-forth. Every candidate is who they say they are.",
    name: "Michael Torres",
    initials: "MT",
    title: "VP of Engineering, ScaleAI",
  },
  {
    quote:
      "The Vouch Score gave me an edge. Employers reached out to me — I never had to cold-apply again.",
    name: "Priya Nair",
    initials: "PN",
    title: "Data Scientist",
  },
];

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-[var(--font-body)]">
      {/* ─── Fixed Top Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-4">
          <Link
            href="/"
            className="font-[var(--font-headline)] font-black text-2xl text-foreground tracking-tight"
          >
            Vouch
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#hero"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </a>
            <a
              href="#benefits"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              For Candidates
            </a>
            <a
              href="#employers"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              For Employers
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-all shadow-sm"
              >
                My Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section
        id="hero"
        className="pt-28 pb-20 lg:pt-36 lg:pb-28 px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-start"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-muted-foreground backdrop-blur-sm mb-6"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Trust-Based Recruiting
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-[var(--font-headline)] text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.95] text-foreground"
            >
              Stop applying.
              <br />
              <span className="text-primary">Start getting selected.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              Vouch is the AI-powered verification platform that proves who you
              are, showcases what you can do, and lets top employers discover
              you — no more cold applications.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/signup?role=candidate"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-all shadow-lg"
              >
                Get Verified
                <MaterialIcon name="arrow_forward" className="text-lg" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-foreground border border-border rounded-full hover:bg-muted transition-all">
                <MaterialIcon name="play_circle" className="text-xl" />
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Right column — hero image with overlay card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[600px]">
              <img
                src="/hero-guy.png"
                alt="Verified professional on Vouch platform"
                className="w-full h-[600px] object-cover object-[center_15%]"
              />
            </div>

            {/* Glass overlay card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute bottom-6 left-6 right-6 sm:left-8 sm:right-auto sm:max-w-xs backdrop-blur-xl bg-white/80 dark:bg-card/80 rounded-2xl p-5 shadow-xl border border-white/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                  AR
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-foreground">
                      Alex Rivers
                    </span>
                    <MaterialIcon
                      name="verified"
                      className="text-primary text-base"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Verified Candidate
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  Vouch Score
                </span>
                <span className="font-[var(--font-headline)] text-2xl font-black text-primary">
                  840
                </span>
                <span className="text-xs font-semibold text-primary bg-secondary-container px-2 py-0.5 rounded-full">
                  Top 2%
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Bento Grid Benefits ─── */}
      <section id="benefits" className="py-20 lg:py-28 bg-muted">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-[var(--font-headline)] text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              The Candidate Space
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg">
              Everything you need to stand out, verified and ready.
            </p>
          </motion.div>

          <div className="grid grid-cols-12 gap-5">
            {/* 8-col: Instant AI Parsing */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="col-span-12 md:col-span-8 rounded-3xl bg-card border border-border overflow-hidden"
            >
              <div className="p-8 flex flex-col justify-center">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center mb-4">
                  <MaterialIcon
                    name="electric_bolt"
                    className="text-primary text-2xl"
                  />
                </div>
                <h3 className="font-[var(--font-headline)] text-xl font-bold mb-2">
                  Instant AI Parsing
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upload your resume and our AI extracts your skills,
                  experience, and credentials in seconds — building your
                  verified profile automatically.
                </p>
              </div>
            </motion.div>

            {/* 4-col: Vouch Score */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="col-span-12 sm:col-span-6 md:col-span-4 rounded-3xl bg-primary text-white p-8 flex flex-col justify-between min-h-[260px]"
            >
              <div>
                <h3 className="font-[var(--font-headline)] text-xl font-bold mb-2">
                  Vouch Score
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Your trust metric. The higher you score, the more visible you
                  become to employers.
                </p>
              </div>
              <div className="mt-6">
                <span className="font-[var(--font-headline)] text-7xl font-black leading-none">
                  840
                </span>
              </div>
            </motion.div>

            {/* 4-col: Portable Identity */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="col-span-12 sm:col-span-6 md:col-span-4 rounded-3xl bg-card border border-border p-8 flex flex-col justify-between min-h-[260px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center mb-4">
                <MaterialIcon
                  name="badge"
                  className="text-primary text-2xl"
                />
              </div>
              <div>
                <h3 className="font-[var(--font-headline)] text-xl font-bold mb-2">
                  Portable Identity
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  One verified profile. Share it anywhere. Your credentials
                  follow you across jobs, platforms, and industries.
                </p>
              </div>
            </motion.div>

            {/* 8-col: 24/7 AI Coach */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={4}
              variants={fadeUp}
              className="col-span-12 md:col-span-8 rounded-3xl bg-card border border-border p-8 flex flex-col sm:flex-row items-center gap-6 min-h-[200px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center flex-shrink-0">
                <MaterialIcon
                  name="smart_toy"
                  className="text-primary text-3xl"
                />
              </div>
              <div>
                <h3 className="font-[var(--font-headline)] text-xl font-bold mb-2">
                  24/7 AI Coach
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  Get personalized guidance on boosting your profile, improving
                  your Vouch Score, and preparing for interviews — powered by AI
                  that understands your career trajectory.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Employer Section ─── */}
      <section id="employers" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[2.5rem] overflow-hidden shadow-xl"
          >
            <img
              src="/employers-meeting.png"
              alt="Three professionals collaborating in a sunlit, plant-filled workspace"
              className="w-full h-auto object-cover"
            />
          </motion.div>

          {/* Right — content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4"
            >
              For Employers
            </motion.span>

            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-[var(--font-headline)] text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
            >
              Hire with 100% confidence,
              <br />
              0% bias.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 text-muted-foreground text-lg max-w-lg"
            >
              Access a marketplace of pre-verified talent. Every candidate has
              been through identity, credential, and background checks before
              you ever see their profile.
            </motion.p>

            <div className="mt-8 space-y-5">
              {[
                {
                  title: "Pre-verified Talent",
                  desc: "Every candidate is verified across identity, work authorization, and credentials before entering the marketplace.",
                },
                {
                  title: "Smart Semantic Search",
                  desc: "Find the right candidate in seconds with AI-powered search that understands skills, context, and intent.",
                },
                {
                  title: "Radical Compliance",
                  desc: "I-9 compliance, work authorization tracking, and audit-ready records. Built-in from day one.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  custom={i + 3}
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <MaterialIcon
                      name="check"
                      className="text-white text-base"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} custom={6} className="mt-10">
              <Link
                href="/employer/marketplace"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-all shadow-lg"
              >
                Request Employer Access
                <MaterialIcon name="arrow_forward" className="text-lg" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-[var(--font-headline)] text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Trusted by professionals
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Hear from candidates and employers who are building trust at
              scale.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                animate="visible"
                  custom={i + 1}
                variants={fadeUp}
                className="relative bg-card border border-border rounded-2xl p-8"
              >
                <MaterialIcon
                  name="format_quote"
                  className="absolute top-6 right-6 text-3xl text-border"
                />
                <p className="text-foreground leading-relaxed mb-8 pr-8">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">
                      {t.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.title}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 lg:py-28 bg-muted">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-[var(--font-headline)] text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Free for candidates. Simple plans for employers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {/* Growth */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="flex flex-col p-8 rounded-2xl border border-border bg-card"
            >
              <h3 className="font-[var(--font-headline)] text-lg font-bold">
                Growth
              </h3>
              <div className="mt-4 mb-6">
                <span className="font-[var(--font-headline)] text-4xl font-black">
                  $499
                </span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8 flex-1">
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-primary text-lg"
                  />
                  100 searches/mo
                </li>
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-primary text-lg"
                  />
                  Advanced filters
                </li>
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-primary text-lg"
                  />
                  Saved candidates
                </li>
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-primary text-lg"
                  />
                  Email support
                </li>
              </ul>
              <Link
                href="/signup?role=employer"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border border-border rounded-full hover:bg-muted transition-all text-center"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Enterprise — Featured */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="relative flex flex-col p-8 rounded-2xl bg-primary text-white shadow-2xl scale-100 md:scale-105"
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary-container text-primary text-xs font-bold rounded-full tracking-wide uppercase">
                Most Popular
              </span>
              <h3 className="font-[var(--font-headline)] text-lg font-bold">
                Enterprise
              </h3>
              <div className="mt-4 mb-6">
                <span className="font-[var(--font-headline)] text-4xl font-black">
                  $1,299
                </span>
                <span className="text-white/70">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-white/80 mb-8 flex-1">
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-secondary-container text-lg"
                  />
                  Unlimited searches
                </li>
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-secondary-container text-lg"
                  />
                  All filters + AI ranking
                </li>
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-secondary-container text-lg"
                  />
                  API access
                </li>
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-secondary-container text-lg"
                  />
                  Bulk verification
                </li>
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-secondary-container text-lg"
                  />
                  Priority support
                </li>
              </ul>
              <Link
                href="/signup?role=employer"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold bg-white text-primary rounded-full hover:bg-white/90 transition-all text-center"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Institutional */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="flex flex-col p-8 rounded-2xl border border-border bg-card"
            >
              <h3 className="font-[var(--font-headline)] text-lg font-bold">
                Institutional
              </h3>
              <div className="mt-4 mb-6">
                <span className="font-[var(--font-headline)] text-4xl font-black">
                  Custom
                </span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8 flex-1">
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-primary text-lg"
                  />
                  Everything in Enterprise
                </li>
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-primary text-lg"
                  />
                  Dedicated account manager
                </li>
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-primary text-lg"
                  />
                  Custom integrations
                </li>
                <li className="flex items-center gap-2">
                  <MaterialIcon
                    name="check_circle"
                    className="text-primary text-lg"
                  />
                  SLA guarantees
                </li>
              </ul>
              <Link
                href="/signup?role=employer"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border border-border rounded-full hover:bg-muted transition-all text-center"
              >
                Contact Sales
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary to-primary-container rounded-[3rem] px-8 py-16 sm:px-16 sm:py-20 text-center">
          <motion.h2
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="font-[var(--font-headline)] text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight"
          >
            Ready to be discovered?
          </motion.h2>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="mt-4 text-white/80 text-lg max-w-xl mx-auto"
          >
            Join thousands of verified professionals who stopped applying and
            started getting selected.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold bg-white text-primary rounded-full hover:bg-white/90 transition-all shadow-lg"
            >
              Create Free Profile
              <MaterialIcon name="arrow_forward" className="text-lg" />
            </Link>
            <a
              href="#benefits"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white border border-white/30 rounded-full hover:bg-white/10 transition-all"
            >
              Learn More
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Logo + tagline */}
            <div className="col-span-2 md:col-span-1">
              <Link
                href="/"
                className="font-[var(--font-headline)] font-black text-2xl text-foreground tracking-tight"
              >
                Vouch
              </Link>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                The trust layer for modern hiring. Verify once, get discovered
                everywhere.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-4">
                Platform
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/signup?role=candidate"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    For Candidates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/employer/marketplace"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    For Employers
                  </Link>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Vouch. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with trust in mind.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
