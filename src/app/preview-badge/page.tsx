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
      label: "IDENTITY\nVERIFIED",
      sublabel: "GOV. ID CHECKED",
      color: "#145a2e",
      lightColor: "#22a050",
      rotate: "-3deg",
      icon: "🪪",
    },
    {
      label: "WORK AUTH\nCLEARED",
      sublabel: "H-1B · CBP I-94",
      color: "#0f3d8a",
      lightColor: "#1a6fd4",
      rotate: "2deg",
      icon: "✅",
    },
    {
      label: "SKILLS\nVERIFIED",
      sublabel: "8 OF 10 CONFIRMED",
      color: "#5b1a9e",
      lightColor: "#8b32d4",
      rotate: "-1deg",
      icon: "⚡",
    },
    {
      label: "CERTS\nVERIFIED",
      sublabel: "AWS · GOOGLE CLOUD",
      color: "#92400e",
      lightColor: "#d97706",
      rotate: "3deg",
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
            HERO — Badge card + details
        ══════════════════════════════════════════ */}
        <div className="space-y-4">

          {/* ── Row 1: Badge card + QR card side by side ── */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">

            {/* Badge card (photo + overlay) */}
            <div
              className="flex-shrink-0 relative rounded-3xl overflow-hidden"
              style={{
                width: 268,
                boxShadow: "0 30px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=540&h=720&fit=crop&crop=face"
                alt={demo.name}
                width={268}
                height={356}
                className="object-cover w-full block"
                style={{ height: 356 }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(4,4,18,0.95) 0%, rgba(4,4,18,0.55) 40%, transparent 70%)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">{demo.name}</h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500 rounded text-[9px] font-black tracking-wider text-white">
                    ✓ VERIFIED
                  </span>
                </div>
                <p className="text-xs text-white/60 mb-4 flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" /> {demo.location} · {demo.headline.split("·")[0].trim()}
                </p>
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{ background: "rgba(10,10,25,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ boxShadow: "0 0 16px rgba(34,197,94,0.4)" }}>
                    <ShieldCheck style={{ width: 18, height: 18, color: "white" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">Identity Verified</p>
                    <p className="text-[10px] text-white/55 leading-tight mt-0.5">Work authorization confirmed via government sources</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR card — same height as badge card */}
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/20 to-violet-500/20 rounded-3xl blur-xl" />
              <div
                className="relative h-full bg-[#0d0d1a] border border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 p-6"
                style={{ minHeight: 356 }}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">Share Badge</span>
                </div>
                <div className="bg-[#0d0d1a] rounded-2xl overflow-hidden ring-1 ring-white/10">
                  <Image
                    src={qrUrl}
                    alt="Scan to view verification badge"
                    width={148}
                    height={148}
                    className="w-[148px] h-[148px]"
                    unoptimized
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-white mb-1">Scan to verify</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Add anywhere — resume, LinkedIn, email signature
                  </p>
                </div>
                <div className="text-[9px] text-slate-600 font-mono text-center">{demo.verificationId}</div>
              </div>
            </div>

          </div>

          {/* ── Row 2: Meta chips spanning full width ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

            <div className="relative flex flex-wrap gap-8 justify-center sm:justify-start items-end">
              {demo.pins.map((pin) => (
                <div
                  key={pin.label}
                  className="group flex flex-col items-center gap-2.5 transition-transform duration-300 hover:scale-105 cursor-pointer select-none"
                  style={{ transform: `rotate(${pin.rotate})`, transformOrigin: "center bottom" }}
                >
                  {/* Pin clasp hardware */}
                  <div style={{
                    width: 14,
                    height: 18,
                    borderRadius: "3px 3px 0 0",
                    background: "linear-gradient(180deg, #e8e0c0 0%, #c0a840 40%, #8a7420 100%)",
                    boxShadow: "0 -1px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)",
                    marginBottom: -4,
                    position: "relative",
                    zIndex: 10,
                  }} />

                  {/* Gold rim — outer ring */}
                  <div style={{
                    width: 108,
                    height: 108,
                    borderRadius: "50%",
                    background: "linear-gradient(145deg, #f5e070 0%, #d4a817 25%, #a07818 55%, #c89820 75%, #ecd040 100%)",
                    padding: 8,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
                    flexShrink: 0,
                  }}>
                    {/* Enamel fill — inner circle */}
                    <div style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 38% 28%, ${pin.lightColor} 0%, ${pin.color} 65%)`,
                      boxShadow: "inset 0 4px 12px rgba(0,0,0,0.45), inset 0 -2px 6px rgba(255,255,255,0.08)",
                      display: "flex",
                      flexDirection: "column" as const,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      position: "relative" as const,
                      overflow: "hidden",
                    }}>
                      {/* Enamel gloss highlight */}
                      <div style={{
                        position: "absolute",
                        top: 6,
                        left: 10,
                        width: 26,
                        height: 12,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.18)",
                        filter: "blur(4px)",
                        transform: "rotate(-30deg)",
                      }} />
                      <span style={{ fontSize: 20, lineHeight: 1, position: "relative", zIndex: 1 }}>{pin.icon}</span>
                      <p style={{
                        fontSize: 9,
                        fontWeight: 900,
                        color: "white",
                        textAlign: "center",
                        lineHeight: 1.25,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.03em",
                        padding: "0 5px",
                        whiteSpace: "pre-line",
                        textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                        position: "relative",
                        zIndex: 1,
                      }}>{pin.label}</p>
                      <p style={{
                        fontSize: 5.5,
                        color: "rgba(255,255,255,0.65)",
                        textAlign: "center",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.04em",
                        position: "relative",
                        zIndex: 1,
                        padding: "0 8px",
                        wordBreak: "break-word",
                        lineHeight: 1.3,
                      }}>{pin.sublabel}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* "More Coming" locked pin — gunmetal */}
              <div
                className="group flex flex-col items-center gap-2.5 transition-transform duration-300 hover:scale-105 cursor-pointer select-none opacity-45 hover:opacity-65"
                style={{ transform: "rotate(2deg)", transformOrigin: "center bottom" }}
              >
                <div style={{
                  width: 14, height: 18, borderRadius: "3px 3px 0 0",
                  background: "linear-gradient(180deg, #aaa 0%, #666 40%, #333 100%)",
                  boxShadow: "0 -1px 4px rgba(0,0,0,0.5)", marginBottom: -4, position: "relative", zIndex: 10,
                }} />
                <div style={{
                  width: 108, height: 108, borderRadius: "50%",
                  background: "linear-gradient(145deg, #888 0%, #555 30%, #333 60%, #555 80%, #777 100%)",
                  padding: 8,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.5)",
                }}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: "50%",
                    background: "radial-gradient(circle at 38% 28%, #4a5568 0%, #1a202c 65%)",
                    boxShadow: "inset 0 4px 12px rgba(0,0,0,0.5)",
                    display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 2,
                  }}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>🔒</span>
                    <p style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.25, textTransform: "uppercase" as const, letterSpacing: "0.03em", padding: "0 5px", whiteSpace: "pre-line" }}>
                      {"MORE\nCOMING"}
                    </p>
                    <p style={{ fontSize: 5.5, color: "rgba(255,255,255,0.3)", textAlign: "center", textTransform: "uppercase" as const, letterSpacing: "0.04em", padding: "0 8px" }}>
                      EARN MORE BADGES
                    </p>
                  </div>
                </div>
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
