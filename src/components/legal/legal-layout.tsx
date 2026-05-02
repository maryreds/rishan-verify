import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-[var(--font-body)]">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-4">
          <Link
            href="/"
            className="font-[var(--font-headline)] font-black text-2xl text-foreground tracking-tight inline-flex items-center gap-2"
          >
            <ShieldCheck className="w-6 h-6 text-primary" />
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
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Body */}
      <main className="pt-32 pb-20 px-6 lg:px-12">
        <article className="max-w-3xl mx-auto">
          <span className="inline-block rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-6">
            DRAFT — pending legal review
          </span>

          <h1 className="font-[var(--font-headline)] text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] text-foreground">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated {lastUpdated}
          </p>

          <div className="mt-10 space-y-8 text-foreground/90 leading-relaxed [&_h2]:font-[var(--font-headline)] [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-base [&_p]:text-foreground/80 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:text-foreground/80 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:text-foreground/80 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80 [&_strong]:text-foreground">
            {children}
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="font-[var(--font-headline)] font-black text-lg text-foreground tracking-tight"
          >
            Vouch
          </Link>
          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              Cookies
            </Link>
            <a
              href="mailto:hello@knomadic.io"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Vouch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
