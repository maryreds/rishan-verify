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
  MessageSquare,
  Plus,
  Sparkles,
  CheckCircle2,
  Search,
  LayoutDashboard,
  Target,
  BarChart3,
  Shield,
  Bot,
  Settings,
  ChevronRight,
} from "lucide-react";
import { AchievementBadgesRow } from "@/components/vouch/achievement-badges-row";

// Preview badge with sample data (Elena Rodriguez)
export default function PreviewBadgePage() {
  const candidate = {
    name: "Elena Rodriguez",
    location: "San Francisco, CA",
    headline: "Senior Product Designer & Systems Architect",
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    verificationId: "VCH-2026-E7R3K9",
    immigrationStatus: "US Citizen",
    verifiedDate: "March 15, 2026",
    validUntil: "March 15, 2027",
    tags: ["Remote First", "2 Weeks Notice"],
    trustAudit: [
      {
        label: "Identity Verification",
        description: "Government-issued ID + biometric match",
        status: "verified" as const,
      },
      {
        label: "SSN Trace & Address History",
        description: "7-year address history and identity trace",
        status: "verified" as const,
      },
      {
        label: "Global Watchlist & Sanctions",
        description: "OFAC, FBI, Interpol, and international lists",
        status: "cleared" as const,
      },
    ],
    competencies: [
      { skill: "Design Systems", level: "Expert", pct: 96, color: "bg-green-500" },
      { skill: "Product Strategy", level: "Expert", pct: 91, color: "bg-green-500" },
      { skill: "UX Research", level: "Advanced", pct: 78, color: "bg-amber-500" },
      { skill: "Figma", level: "Intermediate", pct: 65, color: "bg-orange-400" },
    ],
    techStack: [
      "Design Systems", "Product Strategy",
      "UX Research", "Figma", "React",
      "Accessibility", "User Testing", "Prototyping",
      "Design Tokens", "WCAG Compliance",
      "Cross-functional Leadership", "Data-Driven Design",
    ],
    references: [
      {
        name: "James Chen",
        role: "VP of Engineering at TechCorp",
        quote: "Elena is consistently described as a high-impact contributor with strong technical depth. Peers highlight exceptional problem-solving ability, collaborative communication style, and a bias toward action that accelerates team velocity.",
      },
    ],
    experience: [
      {
        title: "Senior Product Designer",
        company: "TechCorp Inc.",
        period: "2022 — Present",
        description: "Led design system architecture serving 12 product teams. Reduced component inconsistencies by 73%.",
      },
      {
        title: "Product Designer",
        company: "DesignLab Studio",
        period: "2019 — 2022",
        description: "Shipped 3 major product launches. Established user research practice from scratch.",
      },
    ],
    education: [
      {
        institution: "Rhode Island School of Design",
        degree: "BFA Industrial Design",
        period: "2015 — 2019",
      },
    ],
  };

  const statusBadge = (status: "verified" | "cleared") => {
    if (status === "verified") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-semibold tracking-wide uppercase">
          <CheckCircle2 className="w-3 h-3" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-semibold tracking-wide uppercase">
        <ShieldCheck className="w-3 h-3" />
        Cleared
      </span>
    );
  };

  const levelBadge = (level: string) => {
    const colors: Record<string, string> = {
      Expert: "bg-green-100 text-green-700 border-green-200",
      Advanced: "bg-amber-50 text-amber-700 border-amber-200",
      Intermediate: "bg-orange-50 text-orange-600 border-orange-200",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[level] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/80 flex overflow-x-hidden">
      {/* ── Left Sidebar ── */}
      <aside className="hidden lg:flex w-[220px] flex-col bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-40">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Employer</p>
              <p className="text-[10px] text-gray-400">Talent Acquisition</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: false },
            { icon: Target, label: "Job Matches", active: true },
            { icon: BarChart3, label: "Analytics", active: false },
            { icon: Shield, label: "Verify", active: false },
            { icon: Bot, label: "AI Coach", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-default ${
                item.active
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
          ))}
        </nav>

        <div className="px-3 pb-4 mt-auto space-y-3">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-800">Enterprise Plan</p>
            <p className="text-[10px] text-green-600 mt-1">Unlock unlimited searches and advanced analytics.</p>
            <button className="mt-3 w-full py-1.5 bg-green-700 text-white text-xs font-medium rounded-lg hover:bg-green-800 transition-colors">
              Upgrade Now
            </button>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 text-gray-400 text-sm">
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-[220px]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3">
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">Vouch</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/" className="hover:text-gray-600 transition-colors">Marketplace</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-700 font-medium">{candidate.name}</span>
          </div>
        </div>

        <div className="px-4 md:px-8 py-8 max-w-6xl">
          {/* ── Profile Header ── */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
            <div className="flex items-start gap-5">
              <div className="relative flex-shrink-0">
                <Image
                  alt={candidate.name}
                  src={candidate.photo}
                  width={100}
                  height={100}
                  className="w-[100px] h-[100px] rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center border-3 border-white shadow">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {candidate.name}
                  </h1>
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{candidate.headline}</p>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  {candidate.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {candidate.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                Add to Pipeline
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                <MessageSquare className="w-4 h-4" />
                Message Candidate
              </button>
            </div>
          </div>

          {/* ── Two Column Layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Trust Audit Report */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <ShieldCheck className="w-5 h-5 text-gray-700" />
                  <h2 className="text-base font-bold text-gray-900">Trust Audit Report</h2>
                </div>
                <div className="space-y-4">
                  {candidate.trustAudit.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {i === 0 && <Fingerprint className="w-4 h-4 text-gray-500" />}
                          {i === 1 && <FileCheck className="w-4 h-4 text-gray-500" />}
                          {i === 2 && <Shield className="w-4 h-4 text-gray-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {statusBadge(item.status)}
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Reference Synthesis */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-700" />
                    <h2 className="text-base font-bold text-gray-900">Verified Reference Synthesis</h2>
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-xs font-medium hover:bg-violet-100 transition-colors">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Insights
                  </button>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Based on {candidate.references.length} verified peer vouches, {candidate.name.split(" ")[0]} is consistently described as a high-impact contributor with strong technical depth. Peers highlight exceptional problem-solving ability, collaborative communication style, and a bias toward action that accelerates team velocity.
                </p>
              </div>

              {/* Experience */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-gray-700" />
                  <h2 className="text-base font-bold text-gray-900">Experience</h2>
                </div>
                <div className="space-y-4">
                  {candidate.experience.map((exp, i) => (
                    <div key={i} className="relative pl-6 border-l-2 border-gray-100">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                      <p className="text-xs text-gray-500">{exp.company}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{exp.period}</p>
                      {exp.description && (
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Competency Matrix */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="w-5 h-5 text-gray-700" />
                  <h2 className="text-base font-bold text-gray-900">Competency Matrix</h2>
                </div>
                <div className="space-y-4">
                  {candidate.competencies.map((comp, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-gray-700">{comp.skill}</p>
                        <div className="flex items-center gap-2">
                          {levelBadge(comp.level)}
                          <span className="text-xs text-gray-400 w-8 text-right">{comp.pct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${comp.color}`}
                          style={{ width: `${comp.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Technical Stack */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Technical Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verification Badges */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Shield className="w-5 h-5 text-gray-700" />
                  <h2 className="text-base font-bold text-gray-900">Verification Badges</h2>
                </div>
                <AchievementBadgesRow
                  identity={true}
                  workAuth={true}
                  background={true}
                  education={true}
                  references={true}
                  size="md"
                />
              </div>

              {/* Education */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-gray-700" />
                  <h2 className="text-base font-bold text-gray-900">Education</h2>
                </div>
                <div className="space-y-3">
                  {candidate.education.map((edu, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold text-gray-900">{edu.institution}</p>
                      <p className="text-xs text-gray-500">{edu.degree}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{edu.period}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code Share */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-1.5">
                    <img
                      alt="Scan to view verified profile"
                      width={80}
                      height={80}
                      className="w-[80px] h-[80px]"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent("https://vouch-app-xi.vercel.app/preview-badge")}&bgcolor=ffffff&color=000000&margin=4`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Share Verified Profile</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Scan QR code or share link to verify this candidate instantly.
                    </p>
                    <p className="text-[10px] text-gray-300 font-mono mt-2">{candidate.verificationId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-8 py-6 border-t border-gray-200 bg-white mt-8">
          <p className="text-xs text-gray-400 text-center">
            Verified by{" "}
            <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
              Vouch
            </Link>{" "}
            — The trusted marketplace for pre-verified candidates
          </p>
        </div>
      </main>
    </div>
  );
}
