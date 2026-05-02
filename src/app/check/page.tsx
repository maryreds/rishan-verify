import type { Metadata } from "next";
import Link from "next/link";
import { CheckWaitlistForm } from "./check-waitlist-form";

export const metadata: Metadata = {
  title: "Check if your résumé is AI-generated · Vouch",
  description:
    "Free AI-generated résumé detector. Upload your résumé and get a privacy-first score in 30 seconds. Coming soon — join the waitlist.",
  openGraph: {
    title: "Is your résumé AI-generated? · Vouch",
    description:
      "Free AI résumé detector. Get an Authenticity Score in 30 seconds. Powered by Vouch — the verified candidate marketplace.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Is your résumé AI-generated? · Vouch",
    description:
      "Free AI résumé detector. Get an Authenticity Score in 30 seconds.",
  },
};

const STAT_BLOCKS = [
  {
    stat: "73%",
    label: "of job seekers have used AI to write résumé content (2025).",
  },
  {
    stat: "$600B",
    label: "annual cost of résumé fraud to US employers.",
  },
  {
    stat: "8 min",
    label: "average time recruiters now spend doubting whether a résumé is real.",
  },
];

const FAQS = [
  {
    q: "What does the score actually measure?",
    a: "It looks for the linguistic fingerprints AI writers leave behind — clichés, generic phrasing, suspiciously round numbers, dates that don't reconcile, and patterns that match large-language-model output. The score is a probability, not a verdict.",
  },
  {
    q: "Is using AI to write a résumé bad?",
    a: "No. AI is a great editor. The problem is when AI invents experience that doesn't exist. The Authenticity Score helps you spot AI-invented claims so you can replace them with real, verifiable ones — and pair them with a Vouch-verified profile so employers know which parts are real.",
  },
  {
    q: "What happens to the résumé I upload?",
    a: "We process it once and never store it. No selling to recruiters, no training data, no spam. Your email gets you the score and updates about Vouch — nothing else.",
  },
  {
    q: "Why does Vouch care about this?",
    a: "Because verified > written. Vouch is the candidate trust mark that proves the parts of your résumé that actually happened — identity, work authorization, references, credentials. Pair an Authenticity Score with a Vouch profile and employers stop guessing.",
  },
];

export default function CheckPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-[var(--font-body)]">
      {/* ── Top Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-4">
          <Link
            href="/"
            className="font-[var(--font-headline)] font-black text-2xl text-foreground tracking-tight"
          >
            Vouch
          </Link>
          <div className="flex items-center gap-3">
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
              Get Verified
            </Link>
          </div>
        </div>
      </nav>

      <div className="h-16" />

      {/* ── Hero ── */}
      <section className="pt-16 pb-12 lg:pt-24 lg:pb-16 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-muted-foreground backdrop-blur-sm mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Free tool · Coming Soon
          </div>
          <h1 className="font-[var(--font-headline)] text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Is your résumé{" "}
            <span className="text-primary">AI-generated?</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Upload your résumé and get a free{" "}
            <strong className="text-foreground">Authenticity Score</strong> in 30
            seconds. We flag the AI-flavored phrases, generic claims, and
            timeline gaps that recruiters secretly downrank in 2026 — so you can
            fix them before they cost you the interview.
          </p>

          <div className="mt-10 max-w-md mx-auto">
            <CheckWaitlistForm />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            We don&apos;t store your résumé. We don&apos;t share your email.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-6 lg:px-12 bg-muted/40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {STAT_BLOCKS.map((b) => (
            <div key={b.stat} className="text-center md:text-left">
              <div className="font-[var(--font-headline)] text-5xl md:text-6xl font-black text-primary tracking-tight">
                {b.stat}
              </div>
              <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {b.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-[var(--font-headline)] text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
            How the Authenticity Score works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-[var(--font-headline)] font-bold text-lg mb-2">
                Upload your résumé
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                PDF, DOCX, or paste plain text. Processed in-memory, deleted
                immediately.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-[var(--font-headline)] font-bold text-lg mb-2">
                We score every section
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Linguistic fingerprints, generic phrases, timeline anomalies,
                and unverifiable claims. Each section gets its own risk score.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-[var(--font-headline)] font-bold text-lg mb-2">
                Get a Vouch-Verified badge
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pair your Authenticity Score with a verified Vouch profile —
                identity, work auth, references, credentials all checked. Stop
                being mistaken for an AI résumé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 lg:px-12 bg-muted/40">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-[var(--font-headline)] text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-10">
            FAQ
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group bg-card border border-border rounded-xl p-5 open:bg-card"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="font-semibold text-base">{f.q}</span>
                  <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-45">
                    add
                  </span>
                </summary>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center bg-primary text-primary-foreground rounded-3xl p-10 md:p-14">
          <h2 className="font-[var(--font-headline)] text-3xl md:text-4xl font-extrabold tracking-tight">
            Want to skip the score and just be verified?
          </h2>
          <p className="mt-4 text-base text-primary-foreground/80 leading-relaxed max-w-xl mx-auto">
            Build a Vouch profile in 5 minutes. Identity, work auth, and
            references all checked once — carry the verified badge to every
            employer.
          </p>
          <Link
            href="/signup?role=candidate"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-colors"
          >
            Get Vouch Verified
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 lg:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© Vouch · Verified candidate marketplace.</span>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
