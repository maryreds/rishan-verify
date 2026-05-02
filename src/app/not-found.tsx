import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="font-[var(--font-headline)] text-7xl font-black text-primary tracking-tight">
          404
        </div>
        <h1 className="mt-4 font-[var(--font-headline)] text-3xl sm:text-4xl font-black tracking-tight leading-tight">
          We couldn&apos;t verify that page.
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          The link may be expired, mistyped, or the profile may have been removed.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-all shadow-lg"
          >
            Go home
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-foreground border border-border rounded-full hover:bg-muted transition-all"
          >
            Get verified
          </Link>
        </div>
      </div>
    </div>
  );
}
