import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  Upload,
  FileSearch,
  BadgeCheck,
  Scale,
  TrendingDown,
} from "lucide-react";

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

const avatarUrls = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <span className="text-base font-semibold tracking-tight">Rishan</span>
          <span className="text-muted-foreground/40 select-none">&mdash;&mdash;</span>
          <span className="text-base font-semibold tracking-tight">Verify</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#employers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Employers</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-muted rounded-full p-0.5 gap-0.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground">
              <Sun className="w-3.5 h-3.5" />Light
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground">
              <Moon className="w-3.5 h-3.5" />Dark
            </div>
          </div>
          <Link className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/login">
            Log In
          </Link>
          <Link className="px-5 py-2.5 text-sm font-semibold text-white bg-foreground rounded-full hover:opacity-90 transition-all" href="/signup">
            Get Verified
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative">
        <div className="relative z-10">
          <section className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-20 lg:pt-20 lg:pb-32">
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full mb-6">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Recognized by top recruiters nationwide
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif leading-[1.1] tracking-tight">
                  Cut through the noise.{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Get the verified badge.
                  </span>
                </h1>

                <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Don&apos;t let your resume get lost in a sea of automated
                  applications. Earn a free, recruiter-trusted badge that
                  verifies your identity and work authorization — instantly
                  moving you to the top of the pile.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-foreground rounded-full hover:opacity-90 transition-all"
                    href="/signup"
                  >
                    Get Verified for Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium text-foreground bg-transparent border border-border rounded-full hover:bg-muted transition-all"
                    href="#how-it-works"
                  >
                    See how it works
                  </a>
                </div>

                <div className="mt-12 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {avatarUrls.map((url, i) => (
                      <Image
                        key={i}
                        alt=""
                        src={url}
                        width={36}
                        height={36}
                        className="rounded-full border-2 border-background object-cover"
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      Trusted by{" "}
                      <span className="font-semibold text-foreground">
                        500+
                      </span>{" "}
                      professionals
                    </span>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden border border-border">
                  <Image
                    alt="Professional woman at work"
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=900&fit=crop&crop=face"
                    width={800}
                    height={900}
                    className="w-full h-[500px] lg:h-[580px] object-cover"
                    priority
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 65%)",
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        Sofia Rivera
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 rounded text-[10px] font-black tracking-wider text-white">
                        &#10003; VERIFIED
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-5 flex items-center gap-1.5">
                      <span>Austin, TX</span>
                      <span className="opacity-40">&middot;</span>
                      <span>UX / UI Designer</span>
                    </p>
                    <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-black/50 backdrop-blur-md border border-white/10">
                      <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <ShieldCheck
                          className="text-white"
                          style={{ width: 18, height: 18 }}
                        />
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
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Stats */}
      <section className="border-y border-border bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Verified Candidates" },
              { value: "99.8%", label: "Accuracy Rate" },
              { value: "<24h", label: "Avg. Verification Time" },
              { value: "100%", label: "Documents Destroyed" },
            ].map(({ value, label }) => (
              <div className="text-center" key={label}>
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Candidates Gallery */}
      <section className="relative py-16 lg:py-20">
        <div className="text-center mb-10 relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            500+ professionals verified and counting
          </p>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex gap-5 px-6 overflow-x-auto scrollbar-hide pb-4">
            {verifiedCandidates.map((candidate) => (
              <div key={candidate.name} className="flex-shrink-0 w-[180px]">
                <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="relative">
                    <img
                      alt={candidate.name}
                      loading="lazy"
                      width={180}
                      height={220}
                      className="w-full h-[220px] object-cover"
                      src={candidate.img}
                    />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-emerald-500 rounded px-1.5 py-0.5">
                      <ShieldCheck className="w-3 h-3 text-white" />
                      <span className="text-[8px] font-bold text-white tracking-wide">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {candidate.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {candidate.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight">
              Three steps to verified
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Get your verified badge in under 24 hours. It&apos;s free, secure, and
              your documents are destroyed after review.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "1. Upload Your Resume",
                desc: "Our AI extracts your experience, education, and skills automatically.",
              },
              {
                icon: FileSearch,
                title: "2. Submit Your ID",
                desc: "Upload a photo of your passport or government ID. It's encrypted and deleted after review.",
              },
              {
                icon: BadgeCheck,
                title: "3. Get Your Badge",
                desc: "A human reviewer verifies your identity. Share your badge link anywhere.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-8 rounded-2xl border border-border bg-card"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employer Value Proposition */}
      <section id="employers" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight">
              For Employers &amp; Staffing Firms
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop wasting days on verification. Start hiring pre-verified talent.
            </p>
          </div>
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
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-8 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Start free. Scale as you grow.
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
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 50 searches/mo</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Basic filters</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Email support</li>
              </ul>
              <Link
                href="/employer/billing"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border border-border rounded-full hover:bg-muted transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Professional */}
            <div className="relative flex flex-col p-8 rounded-2xl border-2 border-emerald-500 bg-card shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                Most Popular
              </span>
              <h3 className="text-lg font-semibold">Professional</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">$499</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8 flex-1">
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Unlimited searches</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Advanced filters</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Saved candidates</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Priority support</li>
              </ul>
              <Link
                href="/employer/billing"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-emerald-500 rounded-full hover:bg-emerald-600 transition-all"
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
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Everything in Pro</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> API access</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Bulk verification</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Dedicated support</li>
              </ul>
              <a
                href="mailto:sales@rishanverify.com"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border border-border rounded-full hover:bg-muted transition-all"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Social Proof */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-10">
            Trusted by staffing firms nationwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Candidates Verified" },
              { value: "99.8%", label: "Verification Accuracy" },
              { value: "<24h", label: "Avg. Verification Time" },
              { value: "$0", label: "Document Retention" },
            ].map(({ value, label }) => (
              <div className="text-center" key={label}>
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif tracking-tight mb-6">
            Ready to stand out?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join 500+ professionals who have earned their verified badge and are
            getting noticed by top recruiters.
          </p>
          <Link
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-foreground rounded-full hover:opacity-90 transition-all"
            href="/signup"
          >
            Get Verified for Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-semibold">Rishan Verify</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Rishan Verify. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
