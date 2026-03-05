import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Upload,
  UserCheck,
  Share2,
  Lock,
  Zap,
  Globe,
  BadgeCheck,
  ArrowRight,
  ChevronRight,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#06060f] text-white overflow-hidden">
      {/* ===================== NAV ===================== */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-blue-400" />
          <span className="text-lg font-bold tracking-tight">Rishan Verify</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/preview-badge"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            See Example
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-full hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-600/20"
          >
            Get Verified
          </Link>
        </div>
      </nav>

      {/* ===================== HERO ===================== */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-36">
        {/* Gradient orbs background */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-slate-300">Trusted by recruiters nationwide</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Prove you&apos;re real.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                Stand out from the fakes.
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-lg">
              The staffing industry is flooded with fake candidates and fabricated
              resumes. Get a verified badge that proves your identity and work
              authorization — trusted by employers everywhere.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-full hover:from-blue-500 hover:to-violet-500 transition-all shadow-xl shadow-blue-600/25"
              >
                Get Verified — It&apos;s Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium text-slate-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
              >
                See how it works
              </Link>
            </div>

            {/* Mini social proof */}
            <div className="mt-12 flex items-center gap-4">
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
                    className="rounded-full border-2 border-[#06060f] object-cover"
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-slate-400">Trusted by 500+ professionals</span>
              </div>
            </div>
          </div>

          {/* Right: hero photo */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-violet-600/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=900&fit=crop&crop=face"
                alt="Professional woman at work"
                width={800}
                height={900}
                className="w-full h-[500px] lg:h-[580px] object-cover"
                priority
              />
              {/* Overlay card */}
              <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <BadgeCheck className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Identity Verified</p>
                    <p className="text-xs text-slate-400">Work authorization confirmed via government sources</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS BAR ===================== */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Verified Candidates" },
              { value: "99%", label: "Accuracy Rate" },
              { value: "<24h", label: "Avg. Verification Time" },
              { value: "100%", label: "Documents Destroyed" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how-it-works" className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">How It Works</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold">
              Three steps to a{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                verified career
              </span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Our human-reviewed verification process is fast, secure, and respected
              by employers across the staffing industry.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
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
            ].map(({ step, icon: Icon, title, desc, gradient, iconColor }) => (
              <div
                key={step}
                className="group relative bg-gradient-to-b border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all"
                style={{
                  background: `linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`,
                }}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <span className="text-xs font-bold text-slate-600">{step}</span>
                  <div className="mt-4 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURE SECTION WITH PHOTOS ===================== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Photo grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-white/5">
                <Image
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop"
                  alt="Team collaborating at work"
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/5">
                <Image
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&crop=face"
                  alt="Professional woman smiling"
                  width={400}
                  height={500}
                  className="w-full h-60 object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="rounded-2xl overflow-hidden border border-white/5">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=500&fit=crop"
                  alt="Diverse team working together"
                  width={400}
                  height={500}
                  className="w-full h-60 object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/5">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                  alt="Professional woman leading a meeting"
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          </div>

          {/* Copy */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">Why Rishan Verify</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold leading-tight">
              Built for real professionals
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                in a world of fakes
              </span>
            </h2>
            <p className="mt-5 text-slate-400 leading-relaxed">
              Recruiters waste hours vetting candidates who exaggerate — or fabricate —
              their credentials. Rishan Verify gives honest professionals a way to stand
              apart with a badge backed by human-reviewed identity verification.
            </p>

            <div className="mt-8 space-y-5">
              {[
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
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mt-0.5">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{title}</h4>
                    <p className="mt-1 text-sm text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">Testimonials</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold">
              Trusted by professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I was tired of being lumped in with fake candidates. My Rishan badge finally lets recruiters see I'm the real deal.",
                name: "Priya Sharma",
                role: "Salesforce Developer",
                photo: "photo-1494790108377-be9c29b29330",
              },
              {
                quote: "The verification was fast and respectful — they took my privacy seriously. Now I share my badge on every application.",
                name: "Michael Chen",
                role: "Data Engineer",
                photo: "photo-1507003211169-0a1dd7228f2d",
              },
              {
                quote: "As a recruiter, I trust Rishan-verified candidates instantly. It saves me hours of background screening per hire.",
                name: "Sarah Williams",
                role: "Senior Recruiter",
                photo: "photo-1438761681033-6461ffad8d80",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-7 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <Image
                    src={`https://images.unsplash.com/${t.photo}?w=80&h=80&fit=crop&crop=face`}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
            Ready to prove you&apos;re{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              the real deal
            </span>
            ?
          </h2>
          <p className="mt-5 text-lg text-slate-400">
            Join hundreds of verified professionals who stand out from the crowd.
            It&apos;s free, fast, and your privacy is guaranteed.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-full hover:from-blue-500 hover:to-violet-500 transition-all shadow-xl shadow-blue-600/25"
            >
              Get Verified — It&apos;s Free
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-white/5 py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-slate-400">Rishan Verify</span>
          </div>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Rishan Consulting. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
