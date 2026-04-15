import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  ExternalLink,
  MapPin,
  Clock,
  Fingerprint,
  FileCheck,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { AchievementBadgesRow } from "@/components/vouch/achievement-badges-row";

// Preview badge with sample data (Ananya Mehta)
export default function PreviewBadgePage() {
  const candidate = {
    name: "Ananya Mehta",
    location: "Dallas, TX",
    headline: "Senior Full-Stack Engineer",
    photo:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=540&h=720&fit=crop&crop=face",
    verificationId: "RV-2026-A7F3K9",
    immigrationStatus: "H-1B Visa",
    verifiedDate: "March 2, 2026",
    validUntil: "March 2, 2027",
    skills: [
      "React",
      "Node.js",
      "TypeScript",
      "AWS",
      "PostgreSQL",
      "GraphQL",
    ],
    experience: [
      {
        title: "Senior Full-Stack Engineer",
        company: "TechCorp Inc.",
        period: "2023 - Present",
      },
      {
        title: "Software Engineer",
        company: "StartupXYZ",
        period: "2020 - 2023",
      },
    ],
    education: [
      {
        institution: "University of Texas at Dallas",
        degree: "M.S. Computer Science",
        period: "2018 - 2020",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#06060f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-sm tracking-tight">
              Vouch
            </span>
          </div>
          <Link
            href="/"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            Get verified yourself <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            {/* Photo Card */}
            <div
              className="flex-shrink-0 relative rounded-3xl overflow-hidden"
              style={{
                width: 268,
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <Image
                alt={candidate.name}
                src={candidate.photo}
                width={268}
                height={356}
                className="object-cover w-full block"
                style={{ height: 356 }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(4,4,18,0.95) 0%, rgba(4,4,18,0.55) 40%, transparent 70%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    {candidate.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500 rounded text-[9px] font-black tracking-wider text-white">
                    &#10003; VERIFIED
                  </span>
                </div>
                <p className="text-xs text-white/60 mb-4 flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />{" "}
                  {candidate.location} &middot; {candidate.headline}
                </p>
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: "rgba(10,10,25,0.7)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ boxShadow: "0 0 16px rgba(34,197,94,0.4)" }}
                  >
                    <ShieldCheck
                      style={{ width: 18, height: 18, color: "white" }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">
                      Identity Verified
                    </p>
                    <p className="text-[10px] text-white/55 leading-tight mt-0.5">
                      Work authorization confirmed via government sources
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/20 to-violet-500/20 rounded-3xl blur-xl" />
              <div
                className="relative h-full bg-[#0d0d1a] border border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 p-6"
                style={{ minHeight: 356 }}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">
                    Share Badge
                  </span>
                </div>
                <div className="bg-[#0d0d1a] rounded-2xl overflow-hidden ring-1 ring-white/10">
                  <img
                    alt="Scan to view verification badge"
                    width={148}
                    height={148}
                    className="w-[148px] h-[148px]"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https%3A%2F%2Fvouch.app%2Fpreview-badge&bgcolor=0d0d1a&color=ffffff&margin=12`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-white mb-1">
                    Scan to verify
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Add anywhere — resume, LinkedIn, email signature
                  </p>
                </div>
                <div className="text-[9px] text-slate-600 font-mono text-center">
                  {candidate.verificationId}
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                <Fingerprint className="w-3 h-3" /> Verification ID
              </p>
              <p className="text-sm font-semibold text-white truncate">
                {candidate.verificationId}
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                <FileCheck className="w-3 h-3" /> Work Auth
              </p>
              <p className="text-sm font-semibold text-white truncate">
                {candidate.immigrationStatus}
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Verified
              </p>
              <p className="text-sm font-semibold text-white truncate">
                {candidate.verifiedDate}
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Valid Until
              </p>
              <p className="text-sm font-semibold text-white truncate">
                {candidate.validUntil}
              </p>
            </div>
          </div>
        </div>

        {/* Verified Badges Section */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Verified Badges
          </p>
          <div className="relative bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-3xl p-8">
            <AchievementBadgesRow
              identity={true}
              workAuth={true}
              background={false}
              education={true}
              references={false}
              size="lg"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            Skills &amp; Technologies
          </p>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-full text-xs text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Experience
          </p>
          <div className="space-y-3">
            {candidate.experience.map((exp) => (
              <div
                key={exp.title}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-4"
              >
                <p className="font-semibold text-white text-sm">{exp.title}</p>
                <p className="text-xs text-slate-400">{exp.company}</p>
                <p className="text-xs text-slate-500 mt-0.5">{exp.period}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> Education
          </p>
          <div className="space-y-3">
            {candidate.education.map((edu) => (
              <div
                key={edu.institution}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-4"
              >
                <p className="font-semibold text-white text-sm">
                  {edu.institution}
                </p>
                <p className="text-xs text-slate-400">{edu.degree}</p>
                <p className="text-xs text-slate-500 mt-0.5">{edu.period}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-slate-600">
            Verified by{" "}
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Vouch
            </Link>{" "}
            &mdash; The trusted platform for background-checked candidates
          </p>
        </div>
      </div>
    </div>
  );
}
