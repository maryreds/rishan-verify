import Image from "next/image";
import {
  ShieldCheck,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  MapPin,
  Fingerprint,
  FileCheck2,
  Award,
  Code2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Lock,
  Star,
} from "lucide-react";

/* ─── hardcoded demo data ─── */
const demo = {
  name: "Ananya Mehta",
  initials: "AM",
  headline: "Senior Full-Stack Engineer · AWS Certified",
  location: "Dallas, TX",
  verificationId: "RV-2026-A7F3K9",
  verifiedDate: "March 2, 2026",
  validUntil: "March 2, 2027",
  workAuth: "H-1B Visa",

  verifications: [
    {
      category: "Identity",
      icon: Fingerprint,
      status: "verified" as const,
      detail: "Government-issued ID reviewed by authorized human verifier",
      date: "Mar 2, 2026",
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
    },
    {
      category: "Work Authorization",
      icon: FileCheck2,
      status: "verified" as const,
      detail: "H-1B status confirmed via CBP I-94 government records",
      date: "Mar 2, 2026",
      gradient: "from-blue-500/20 to-blue-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/20",
    },
    {
      category: "Skills Assessment",
      icon: Code2,
      status: "verified" as const,
      detail: "8 of 10 listed skills confirmed through portfolio & code review",
      date: "Mar 3, 2026",
      gradient: "from-violet-500/20 to-violet-500/5",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-400",
      borderColor: "border-violet-500/20",
    },
    {
      category: "Certifications",
      icon: Award,
      status: "verified" as const,
      detail: "AWS Solutions Architect credential confirmed with issuing body",
      date: "Mar 3, 2026",
      gradient: "from-amber-500/20 to-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/20",
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
    {
      name: "AWS Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      verified: true,
      date: "2025",
    },
    {
      name: "Google Cloud Professional Data Engineer",
      issuer: "Google",
      verified: true,
      date: "2024",
    },
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
      desc: "Full-stack development on React + Node.js applications for healthcare clients.",
    },
  ],

  education: [
    {
      institution: "University of Texas at Dallas",
      degree: "M.S. Computer Science",
      period: "2016 — 2018",
    },
    {
      institution: "Mumbai University",
      degree: "B.E. Information Technology",
      period: "2012 — 2016",
    },
  ],
};

export default function BadgePreview() {
  return (
    <div className="min-h-screen bg-[#06060f] text-white">
      {/* ─── Nav ─── */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-sm tracking-tight">
              Rishan Verify
            </span>
          </div>
          <a
            href="/"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            Get verified yourself <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* ═══════════════════════════════════════════════
            HERO BADGE CARD
        ═══════════════════════════════════════════════ */}
        <div className="relative mb-10">
          {/* Glow behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-emerald-600/20 rounded-3xl blur-xl" />

          <div className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
            {/* Top gradient line */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" />

            <div className="px-8 py-8 sm:px-10 sm:py-10">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full blur-sm opacity-60" />
                  <Image
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face"
                    alt={demo.name}
                    width={80}
                    height={80}
                    className="relative w-20 h-20 rounded-full object-cover ring-2 ring-white/10"
                  />
                  {/* Verified tick */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center ring-4 ring-[#0a0a18]">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {demo.name}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{demo.headline}</p>
                  <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {demo.location}
                  </p>
                </div>
              </div>

              {/* Verification meta bar */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: "Verification ID",
                    value: demo.verificationId,
                    icon: Fingerprint,
                  },
                  {
                    label: "Work Authorization",
                    value: demo.workAuth,
                    icon: FileCheck2,
                  },
                  {
                    label: "Verified Since",
                    value: demo.verifiedDate,
                    icon: Clock,
                  },
                  {
                    label: "Valid Until",
                    value: demo.validUntil,
                    icon: Clock,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                      <item.icon className="w-3 h-3" />
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-white truncate">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            VERIFICATION CATEGORIES
        ═══════════════════════════════════════════════ */}
        <div className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            What&apos;s Been Verified
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {demo.verifications.map((v) => (
              <div
                key={v.category}
                className={`relative group bg-gradient-to-b from-white/[0.04] to-transparent border ${v.borderColor} rounded-2xl p-6 hover:border-white/15 transition-all`}
              >
                {/* Hover glow */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${v.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-11 h-11 ${v.iconBg} rounded-xl flex items-center justify-center`}
                    >
                      <v.icon className={`w-5 h-5 ${v.iconColor}`} />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-sm mb-1">
                    {v.category}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {v.detail}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Verified {v.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SKILLS (with verified indicators)
        ═══════════════════════════════════════════════ */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-7 mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-violet-400" />
            Skills
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {demo.skills.map((skill) => (
              <span
                key={skill.name}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  skill.verified
                    ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                    : "bg-white/[0.03] border border-white/5 text-slate-400"
                }`}
              >
                {skill.verified && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                )}
                {skill.name}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-4 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400/60">Verified</span>
            <span className="mx-1">·</span>
            Skills without a checkmark are self-reported
          </p>
        </div>

        {/* ═══════════════════════════════════════════════
            CERTIFICATIONS
        ═══════════════════════════════════════════════ */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-7 mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Certifications
          </h3>
          <div className="space-y-4">
            {demo.certifications.map((cert) => (
              <div
                key={cert.name}
                className="flex items-start gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4"
              >
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-white">
                      {cert.name}
                    </p>
                    {cert.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-full text-emerald-400 text-[10px] font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {cert.issuer} · {cert.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            EXPERIENCE
        ═══════════════════════════════════════════════ */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-7 mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            Experience
          </h3>
          <div className="space-y-6">
            {demo.experience.map((exp, i) => (
              <div
                key={i}
                className="relative pl-7 border-l border-white/10"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#06060f] ${
                    exp.current
                      ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      : "bg-white/20"
                  }`}
                />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {exp.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {exp.company}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-600 whitespace-nowrap mt-0.5">
                    {exp.period}
                  </span>
                </div>
                {exp.desc && (
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {exp.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            EDUCATION
        ═══════════════════════════════════════════════ */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-7 mb-10">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            Education
          </h3>
          <div className="space-y-5">
            {demo.education.map((edu, i) => (
              <div
                key={i}
                className="relative pl-7 border-l border-white/10"
              >
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#06060f] bg-emerald-500" />
                <p className="font-semibold text-white text-sm">
                  {edu.institution}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{edu.degree}</p>
                <p className="text-[10px] text-slate-600 mt-1">{edu.period}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            TRUST FOOTER
        ═══════════════════════════════════════════════ */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-violet-600/5 to-emerald-600/5 rounded-2xl blur-xl" />

          <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Verified by Rishan Verify
                </p>
                <p className="text-xs text-slate-500">
                  Comprehensive identity & credential verification
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {[
                {
                  icon: Fingerprint,
                  text: "Human-reviewed verification",
                },
                {
                  icon: Lock,
                  text: "Documents encrypted & destroyed after review",
                },
                {
                  icon: Globe,
                  text: "Government sources cross-referenced",
                },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 text-[11px] text-slate-500"
                >
                  <item.icon className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-4 text-[10px] text-slate-600">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Verification ID: {demo.verificationId}
                </span>
                <span>Issued: {demo.verifiedDate}</span>
              </div>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full text-xs font-semibold text-white hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-600/20"
              >
                Get Your Verified Badge
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
