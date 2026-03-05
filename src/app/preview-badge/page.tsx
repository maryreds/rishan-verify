import Image from "next/image";
import {
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Fingerprint,
  FileCheck2,
  Award,
  Code2,
  CheckCircle2,
  Clock,
  Globe,
  Lock,
  QrCode,
} from "lucide-react";

const demo = {
  name: "Ananya Mehta",
  initials: "AM",
  headline: "Senior Full-Stack Engineer · AWS Certified",
  location: "Dallas, TX",
  verificationId: "RV-2026-A7F3K9",
  verifiedDate: "March 2, 2026",
  validUntil: "March 2, 2027",
  workAuth: "H-1B Visa",
  profileUrl: "https://rishan-verify.vercel.app/preview-badge",

  pins: [
    {
      label: "Identity\nVerified",
      sublabel: "Gov. ID Checked",
      bg: "bg-emerald-500",
      ring: "ring-emerald-300",
      shadow: "shadow-emerald-900/60",
      rotate: "-rotate-3",
      icon: "🪪",
    },
    {
      label: "Work Auth\nCleared",
      sublabel: "H-1B · CBP I-94",
      bg: "bg-blue-500",
      ring: "ring-blue-300",
      shadow: "shadow-blue-900/60",
      rotate: "rotate-2",
      icon: "✅",
    },
    {
      label: "Skills\nVerified",
      sublabel: "8 of 10 confirmed",
      bg: "bg-violet-500",
      ring: "ring-violet-300",
      shadow: "shadow-violet-900/60",
      rotate: "-rotate-1",
      icon: "⚡",
    },
    {
      label: "Certs\nVerified",
      sublabel: "AWS · Google Cloud",
      bg: "bg-amber-500",
      ring: "ring-amber-300",
      shadow: "shadow-amber-900/60",
      rotate: "rotate-3",
      icon: "🏆",
    },
  ],

  skills: [
    { name: "React", verified: true },
    { name: "TypeScript", verified: true },
    { name: "Node.js", verified: true },
    { name: "AWS", verified: true },
    { name: "PostgreSQL", verified: true },
    { name: "Python", verified: true },
    { name: "Docker", verified: true },
    { name: "GraphQL", verified: true },
    { name: "Next.js", verified: false },
    { name: "Terraform", verified: false },
  ],

  certifications: [
    { name: "AWS Solutions Architect – Associate", issuer: "Amazon Web Services", date: "2025", emoji: "☁️" },
    { name: "Google Cloud Professional Data Engineer", issuer: "Google", date: "2024", emoji: "🔧" },
  ],

  experience: [
    {
      title: "Senior Full-Stack Engineer",
      company: "Infosys BPM",
      period: "2023 — Present",
      current: true,
      desc: "Leading a team of 6 engineers building enterprise cloud migration tools. Reduced deployment time by 40%.",
    },
    {
      title: "Software Engineer II",
      company: "Wipro Technologies",
      period: "2020 — 2023",
      current: false,
      desc: "Developed microservices for a Fortune 500 fintech client. Built real-time data pipelines processing 2M+ events/day.",
    },
    {
      title: "Junior Developer",
      company: "TCS Digital",
      period: "2018 — 2020",
      current: false,
      desc: "Full-stack development on React + Node.js for healthcare clients.",
    },
  ],

  education: [
    { institution: "University of Texas at Dallas", degree: "M.S. Computer Science", period: "2016 — 2018" },
    { institution: "Mumbai University", degree: "B.E. Information Technology", period: "2012 — 2016" },
  ],
};

export default function BadgePreview() {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(demo.profileUrl)}&bgcolor=0d0d1a&color=ffffff&margin=12`;

  return (
    <div className="min-h-screen bg-[#06060f] text-white">

      {/* ─── Nav ─── */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-sm tracking-tight">Rishan Verify</span>
          </div>
          <a href="/" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            Get verified yourself <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* ══════════════════════════════════════════
            HERO — Profile + QR side by side
        ══════════════════════════════════════════ */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-emerald-600/20 rounded-3xl blur-xl" />
          <div className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" />

            <div className="p-8 flex flex-col lg:flex-row gap-8 items-start">

              {/* Left: identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full blur-sm opacity-60" />
                    <Image
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face"
                      alt={demo.name}
                      width={88}
                      height={88}
                      className="relative w-22 h-22 rounded-full object-cover ring-2 ring-white/10"
                      style={{ width: 88, height: 88 }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center ring-4 ring-[#06060f]">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold tracking-tight">{demo.name}</h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] font-bold tracking-wider">
                        ✓ VERIFIED
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{demo.headline}</p>
                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {demo.location}
                    </p>
                  </div>
                </div>

                {/* Meta info chips */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { label: "Verification ID", value: demo.verificationId, icon: Fingerprint },
                    { label: "Work Auth", value: demo.workAuth, icon: FileCheck2 },
                    { label: "Verified", value: demo.verifiedDate, icon: Clock },
                    { label: "Valid Until", value: demo.validUntil, icon: Clock },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                        <item.icon className="w-3 h-3" /> {item.label}
                      </p>
                      <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: QR Code card */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 to-violet-500/30 rounded-2xl blur-lg" />
                  <div className="relative bg-[#0d0d1a] border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-3">
                    {/* RV monogram */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">Rishan Verify</span>
                    </div>

                    {/* QR code */}
                    <div className="bg-[#0d0d1a] rounded-xl overflow-hidden ring-1 ring-white/10">
                      <Image
                        src={qrUrl}
                        alt="Scan to view verification badge"
                        width={160}
                        height={160}
                        className="w-40 h-40"
                        unoptimized
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <QrCode className="w-3 h-3" />
                      <span>Scan to verify identity</span>
                    </div>

                    <div className="text-[9px] text-slate-600 font-mono text-center">
                      {demo.verificationId}
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-600 mt-3 text-center max-w-[160px] leading-relaxed">
                  Add this QR anywhere — resume, LinkedIn, email signature
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            ENAMEL PINS — Verification badges
        ══════════════════════════════════════════ */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Verified Badges
          </p>

          {/* Pin board */}
          <div className="relative bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/8 rounded-3xl p-8">
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 rounded-3xl opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />

            <div className="relative flex flex-wrap gap-6 justify-center sm:justify-start">
              {demo.pins.map((pin) => (
                <div key={pin.label} className={`group flex flex-col items-center gap-2 ${pin.rotate} hover:rotate-0 transition-transform duration-300`}>
                  {/* The pin itself */}
                  <div className={`
                    relative w-28 h-28 rounded-full flex flex-col items-center justify-center
                    ${pin.bg} ring-4 ${pin.ring} ring-opacity-40
                    shadow-2xl ${pin.shadow}
                    cursor-pointer select-none
                  `}
                    style={{
                      boxShadow: `
                        0 0 0 2px rgba(255,255,255,0.15) inset,
                        0 4px 24px rgba(0,0,0,0.5),
                        0 1px 0 rgba(255,255,255,0.3) inset
                      `
                    }}
                  >
                    {/* Shine highlight */}
                    <div className="absolute top-2 left-3 w-8 h-4 bg-white/20 rounded-full blur-sm rotate-[-30deg]" />
                    {/* Rim shadow */}
                    <div className="absolute inset-0 rounded-full ring-[6px] ring-black/20" />

                    <span className="text-2xl mb-1 relative z-10">{pin.icon}</span>
                    <p className="text-[11px] font-black text-white text-center leading-tight relative z-10 px-2 whitespace-pre-line">
                      {pin.label}
                    </p>
                  </div>

                  {/* Pin label below */}
                  <p className="text-[10px] text-slate-500 text-center">{pin.sublabel}</p>
                </div>
              ))}

              {/* "Get yours" teaser pin */}
              <div className="flex flex-col items-center gap-2 rotate-2 hover:rotate-0 transition-transform duration-300 opacity-50 hover:opacity-70">
                <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 border-dashed border-slate-600 cursor-pointer"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
                >
                  <span className="text-2xl mb-1">🔒</span>
                  <p className="text-[11px] font-bold text-slate-500 text-center leading-tight px-2">
                    More<br/>Coming
                  </p>
                </div>
                <p className="text-[10px] text-slate-600 text-center">Earn more badges</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SKILLS
        ══════════════════════════════════════════ */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-7">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-violet-400" /> Skills
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {demo.skills.map((skill) => (
              <span
                key={skill.name}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium ${
                  skill.verified
                    ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                    : "bg-white/[0.03] border border-white/5 text-slate-400"
                }`}
              >
                {skill.verified && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                {skill.name}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-4 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
            <span className="text-emerald-500/50">Verified</span>
            <span className="mx-1">·</span> Skills without a checkmark are self-reported
          </p>
        </div>

        {/* ══════════════════════════════════════════
            CERTIFICATIONS
        ══════════════════════════════════════════ */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-7">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Certifications
          </h3>
          <div className="space-y-3">
            {demo.certifications.map((cert) => (
              <div key={cert.name} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <span className="text-2xl">{cert.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-white">{cert.name}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-full text-emerald-400 text-[10px] font-bold">
                      <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{cert.issuer} · {cert.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            EXPERIENCE
        ══════════════════════════════════════════ */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-7">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" /> Experience
          </h3>
          <div className="space-y-6">
            {demo.experience.map((exp, i) => (
              <div key={i} className="relative pl-7 border-l border-white/10">
                <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#06060f] ${exp.current ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "bg-white/20"}`} />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white text-sm">{exp.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{exp.company}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 whitespace-nowrap mt-0.5">{exp.period}</span>
                </div>
                {exp.desc && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.desc}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            EDUCATION
        ══════════════════════════════════════════ */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-7">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-400" /> Education
          </h3>
          <div className="space-y-5">
            {demo.education.map((edu, i) => (
              <div key={i} className="relative pl-7 border-l border-white/10">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#06060f] bg-emerald-500" />
                <p className="font-semibold text-white text-sm">{edu.institution}</p>
                <p className="text-xs text-slate-400 mt-0.5">{edu.degree}</p>
                <p className="text-[10px] text-slate-600 mt-1">{edu.period}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            TRUST FOOTER
        ══════════════════════════════════════════ */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-violet-600/5 to-emerald-600/5 rounded-2xl blur-xl" />
          <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Verified by Rishan Verify</p>
                <p className="text-xs text-slate-500">Comprehensive identity & credential verification</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {[
                { icon: Fingerprint, text: "Human-reviewed verification" },
                { icon: Lock, text: "Documents encrypted & destroyed after review" },
                { icon: Globe, text: "Government sources cross-referenced" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-[11px] text-slate-500">
                  <item.icon className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-white/5">
              <span className="text-[10px] text-slate-600 font-mono">
                ID: {demo.verificationId} · Issued: {demo.verifiedDate}
              </span>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full text-xs font-semibold text-white hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-600/20"
              >
                Get Your Verified Badge <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
