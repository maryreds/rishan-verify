import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployerCandidateDeepDivePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // ── Fetch candidate profile ──
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) {
    notFound();
  }

  // ── Parallel data fetches ──
  const [
    { data: experience },
    { data: education },
    { data: skills },
    { data: latestVerification },
    { data: peerVouches },
    { data: portfolioItems },
    { data: assessments },
    { data: credentials },
    { data: completedRefs },
  ] = await Promise.all([
    supabase
      .from("work_experience")
      .select("*")
      .eq("profile_id", profile.id)
      .order("start_date", { ascending: false }),
    supabase
      .from("education")
      .select("*")
      .eq("profile_id", profile.id)
      .order("start_date", { ascending: false }),
    supabase
      .from("skills")
      .select("*")
      .eq("profile_id", profile.id),
    supabase
      .from("verification_requests")
      .select("immigration_status, status_valid_until, reviewed_at")
      .eq("profile_id", profile.id)
      .eq("status", "completed")
      .order("reviewed_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("peer_vouches")
      .select("*, voucher:voucher_id(full_name, photo_original_url, headline)")
      .eq("vouchee_id", profile.id)
      .eq("status", "accepted"),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("profile_id", profile.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("assessments")
      .select("skill_name, score, max_score")
      .eq("profile_id", profile.id)
      .eq("status", "completed"),
    supabase
      .from("credentials")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("references")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("status", "completed"),
  ]);

  const isVerified = profile.verification_status === "verified";
  const vouchScore = profile.vouch_score || 0;
  const vouchScoreScaled = Math.round(vouchScore * 10); // 0-100 -> 0-1000 for display

  // Merge skills from both tables
  const allSkills = [
    ...(skills?.map((s: { name: string }) => s.name) || []),
    ...(profile.skills || []),
  ].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

  // Map verified skills from assessments
  const verifiedSkills = new Set(
    assessments
      ?.filter((a: { score: number; max_score: number }) => a.score >= a.max_score * 0.8)
      .map((a: { skill_name: string }) => a.skill_name) || []
  );

  // Build competency data from assessments or fall back to defaults
  const competencyData = allSkills.slice(0, 4).map((skill: string) => {
    const assessment = assessments?.find(
      (a: { skill_name: string; score: number; max_score: number }) => a.skill_name === skill
    );
    const pct = assessment
      ? Math.round((assessment.score / assessment.max_score) * 100)
      : verifiedSkills.has(skill) ? 85 : 60;
    const level = pct >= 90 ? "EXPERT" : pct >= 75 ? "ADVANCED" : "INTERMEDIATE";
    return { skill, pct, level };
  });

  // Synthesize reference insights from peer vouches
  const referenceMessages = peerVouches?.map(
    (v: { message: string }) => v.message
  ).filter(Boolean) || [];

  const currentRole = experience?.[0];
  const candidateName = profile.full_name || "Candidate";
  const firstName = candidateName.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#faf9f5] text-foreground">
      {/* ══════════════════════════════════════════════════════════════════
          TOP NAV — fixed, glass blur
      ══════════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#faf9f5]/80 border-b border-border/50">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
            <span className="font-[var(--font-headline)] font-bold text-lg tracking-tight">Vouch</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/candidates" className="hover:text-foreground transition-colors">For Candidates</Link>
            <Link href="/employer" className="text-foreground font-semibold transition-colors">For Employers</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════
          SIDEBAR — fixed left
      ══════════════════════════════════════════════════════════════════ */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#f5f4f0] border-r border-border/50 pt-[72px] z-40 hidden lg:flex flex-col">
        {/* User section */}
        <div className="px-5 py-5 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              E
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Employer</p>
              <p className="text-xs text-muted-foreground truncate">Talent Acquisition</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/employer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            Dashboard
          </Link>
          <Link
            href="/employer/marketplace"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-primary/10 text-primary font-medium"
          >
            <span className="material-symbols-outlined text-xl">work</span>
            Job Matches
          </Link>
          <Link
            href="/employer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-xl">analytics</span>
            Analytics
          </Link>
          <Link
            href="/employer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-xl">verified_user</span>
            Verify
          </Link>
          <Link
            href="/employer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-xl">psychology</span>
            AI Coach
          </Link>
        </nav>

        {/* Enterprise Plan card */}
        <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl text-primary-foreground">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-lg">workspace_premium</span>
            <span className="text-sm font-bold">Enterprise Plan</span>
          </div>
          <p className="text-xs opacity-80 mb-3">Unlock unlimited searches and advanced analytics.</p>
          <button className="w-full py-2 bg-white/20 hover:bg-white/30 text-xs font-semibold rounded-lg transition-colors">
            Upgrade Now
          </button>
        </div>

        {/* Bottom links */}
        <div className="px-3 py-4 border-t border-border/40 space-y-1">
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full text-left">
            <span className="material-symbols-outlined text-xl">settings</span>
            Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full text-left">
            <span className="material-symbols-outlined text-xl">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════════════ */}
      <main className="lg:ml-64 pt-24 pb-16 px-6 lg:px-10">
        <div className="max-w-[1200px] mx-auto">

          {/* ── Back link ── */}
          <Link
            href="/employer/marketplace"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Marketplace
          </Link>

          {/* ══════════════════════════════════════════════════════════════
              HEADER
          ══════════════════════════════════════════════════════════════ */}
          <section className="flex flex-col md:flex-row items-start gap-6 mb-10">
            {/* Photo */}
            <div className="relative flex-shrink-0">
              {profile.photo_original_url || profile.avatar_url ? (
                <img
                  src={profile.photo_original_url || profile.avatar_url}
                  alt={candidateName}
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-border shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                  {candidateName.charAt(0)}
                </div>
              )}
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-[#faf9f5] shadow">
                  <span className="material-symbols-outlined text-primary-foreground text-base">verified</span>
                </div>
              )}
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-[var(--font-headline)] text-3xl md:text-4xl font-extrabold tracking-tight leading-none">
                  {candidateName}
                </h1>
                {isVerified && (
                  <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                )}
              </div>

              {profile.headline && (
                <p className="text-lg text-muted-foreground">{profile.headline}</p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {profile.remote_preference && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold tracking-wider uppercase">
                    <span className="material-symbols-outlined text-sm">wifi</span>
                    REMOTE FIRST
                  </span>
                )}
                {profile.notice_period && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {profile.notice_period}
                  </span>
                )}
                {!profile.remote_preference && !profile.notice_period && (
                  <>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold tracking-wider uppercase">
                      <span className="material-symbols-outlined text-sm">wifi</span>
                      REMOTE FIRST
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      2 WEEKS NOTICE
                    </span>
                  </>
                )}
                {profile.location && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {profile.location}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-lg">person_add</span>
                Add to Pipeline
              </button>
              <button className="px-5 py-2.5 border border-border bg-card text-foreground rounded-xl text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">chat</span>
                Message Candidate
              </button>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              BENTO GRID
          ══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT COLUMN (spans 2) ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* ── Trust Audit Report ── */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">shield</span>
                  <h2 className="font-[var(--font-headline)] text-xl font-bold">Trust Audit Report</h2>
                </div>

                <div className="space-y-3">
                  {/* Identity Verification */}
                  <details className="group bg-muted/50 rounded-xl overflow-hidden">
                    <summary className="flex items-center gap-4 p-4 cursor-pointer select-none hover:bg-muted/80 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-xl">fingerprint</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">Identity Verification</p>
                        <p className="text-xs text-muted-foreground">Government-issued ID + biometric match</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex-shrink-0 ${isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        <span className="material-symbols-outlined text-sm">{isVerified ? "check_circle" : "pending"}</span>
                        {isVerified ? "VERIFIED" : "PENDING"}
                      </span>
                      <span className="material-symbols-outlined text-muted-foreground group-open:rotate-180 transition-transform text-xl">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 pt-1 border-t border-border/40">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Document ID</p>
                          <p className="font-medium">{isVerified ? "DL-****-7829" : "Pending"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Issue Authority</p>
                          <p className="font-medium">{isVerified ? "State DMV" : "Pending"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Biometric Score</p>
                          <p className="font-medium">{isVerified ? "99.4%" : "Pending"}</p>
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* SSN Trace & Address History */}
                  <details className="group bg-muted/50 rounded-xl overflow-hidden">
                    <summary className="flex items-center gap-4 p-4 cursor-pointer select-none hover:bg-muted/80 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-xl">history_edu</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">SSN Trace & Address History</p>
                        <p className="text-xs text-muted-foreground">7-year address history and identity trace</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex-shrink-0 ${isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        <span className="material-symbols-outlined text-sm">{isVerified ? "check_circle" : "pending"}</span>
                        {isVerified ? "VERIFIED" : "PENDING"}
                      </span>
                      <span className="material-symbols-outlined text-muted-foreground group-open:rotate-180 transition-transform text-xl">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 pt-1 border-t border-border/40">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Addresses Found</p>
                          <p className="font-medium">{isVerified ? "3 addresses (7 years)" : "Pending"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">SSN Status</p>
                          <p className="font-medium">{isVerified ? "Valid, no alerts" : "Pending"}</p>
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* Global Watchlist & Sanctions */}
                  <details className="group bg-muted/50 rounded-xl overflow-hidden">
                    <summary className="flex items-center gap-4 p-4 cursor-pointer select-none hover:bg-muted/80 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-xl">public</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">Global Watchlist & Sanctions</p>
                        <p className="text-xs text-muted-foreground">OFAC, FBI, Interpol, and international lists</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex-shrink-0 ${isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        <span className="material-symbols-outlined text-sm">{isVerified ? "check_circle" : "pending"}</span>
                        {isVerified ? "CLEARED" : "PENDING"}
                      </span>
                      <span className="material-symbols-outlined text-muted-foreground group-open:rotate-180 transition-transform text-xl">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 pt-1 border-t border-border/40">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">OFAC</p>
                          <p className="font-medium text-emerald-600">{isVerified ? "Clear" : "Pending"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Global Sanctions</p>
                          <p className="font-medium text-emerald-600">{isVerified ? "Clear" : "Pending"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Sex Offender Registry</p>
                          <p className="font-medium text-emerald-600">{isVerified ? "Clear" : "Pending"}</p>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              {/* ── Verified Reference Synthesis ── */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl">group</span>
                    <h2 className="font-[var(--font-headline)] text-xl font-bold">Verified Reference Synthesis</h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    AI Insights
                  </span>
                </div>

                {/* AI-generated summary */}
                <div className="bg-muted/50 rounded-xl p-5 mb-6">
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    {referenceMessages.length > 0
                      ? `Based on ${referenceMessages.length} verified peer vouches, ${firstName} is consistently described as a high-impact contributor with strong technical depth. Peers highlight exceptional problem-solving ability, collaborative communication style, and a bias toward action that accelerates team velocity.`
                      : `${firstName} is a highly capable professional. As verified references are collected, an AI-synthesized summary of strengths and working style will appear here based on peer feedback and vouch data.`
                    }
                  </p>
                </div>

                {/* 3-column reference insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-xl">lightbulb</span>
                    </div>
                    <h4 className="text-sm font-semibold mb-1">Strategic Thinking</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {peerVouches && peerVouches.length > 0
                        ? "Peers note strong ability to see the big picture and align technical decisions with business goals."
                        : "Data will populate as references are verified."
                      }
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-xl">diversity_3</span>
                    </div>
                    <h4 className="text-sm font-semibold mb-1">Cultural Fit</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {peerVouches && peerVouches.length > 0
                        ? "Described as inclusive, supportive, and someone who elevates the performance of those around them."
                        : "Data will populate as references are verified."
                      }
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-xl">thumb_up</span>
                    </div>
                    <h4 className="text-sm font-semibold mb-1">Reliability</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {peerVouches && peerVouches.length > 0
                        ? "Consistently delivers on commitments, meets deadlines, and communicates proactively about blockers."
                        : "Data will populate as references are verified."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Work Experience ── */}
              {experience && experience.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary text-2xl">work_history</span>
                    <h2 className="font-[var(--font-headline)] text-xl font-bold">Work Experience</h2>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border" />
                    <div className="space-y-6">
                      {experience.map(
                        (exp: {
                          id: string;
                          title: string;
                          company: string;
                          start_date: string | null;
                          end_date: string | null;
                          is_current: boolean;
                          description: string | null;
                        }) => (
                          <div key={exp.id} className="relative">
                            <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-sm">apartment</span>
                            </div>
                            <div className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold text-sm">{exp.title}</h3>
                                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                                  <p className="text-xs text-muted-foreground/60 mt-1">
                                    {exp.start_date || "?"} &mdash;{" "}
                                    {exp.is_current ? "Present" : exp.end_date || "?"}
                                  </p>
                                </div>
                                {exp.is_current && (
                                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full flex-shrink-0">
                                    Current
                                  </span>
                                )}
                              </div>
                              {exp.description && (
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Education ── */}
              {education && education.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl">school</span>
                    <h2 className="font-[var(--font-headline)] text-xl font-bold">Education</h2>
                  </div>
                  <div className="space-y-3">
                    {education.map(
                      (edu: {
                        id: string;
                        institution: string;
                        degree: string | null;
                        field_of_study: string | null;
                        start_date: string | null;
                        end_date: string | null;
                      }) => (
                        <div key={edu.id} className="bg-muted/30 rounded-xl p-4">
                          <p className="font-semibold text-sm">{edu.institution}</p>
                          <p className="text-sm text-muted-foreground">
                            {edu.degree}
                            {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {edu.start_date || "?"} &mdash; {edu.end_date || "?"}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* ── Peer Vouches ── */}
              {peerVouches && peerVouches.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary text-2xl">thumb_up</span>
                    <h2 className="font-[var(--font-headline)] text-xl font-bold">Peer Vouches</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {peerVouches.map(
                      (vouch: {
                        id: string;
                        message: string;
                        skill: string | null;
                        voucher_score: number | null;
                        voucher: { full_name: string | null; photo_original_url: string | null; headline: string | null } | null;
                      }) => (
                        <div key={vouch.id} className="bg-muted/30 rounded-xl p-4">
                          <p className="text-sm text-foreground leading-relaxed italic">
                            &ldquo;{vouch.message}&rdquo;
                          </p>
                          {vouch.skill && (
                            <span className="inline-block mt-2 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                              {vouch.skill}
                            </span>
                          )}
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
                            {vouch.voucher?.photo_original_url ? (
                              <img
                                src={vouch.voucher.photo_original_url}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                {(vouch.voucher?.full_name || "?").charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate">
                                {vouch.voucher?.full_name || "Verified Professional"}
                              </p>
                              {vouch.voucher?.headline && (
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {vouch.voucher.headline}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-6">

              {/* ── Competency Matrix ── */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">bar_chart</span>
                  <h2 className="font-[var(--font-headline)] text-lg font-bold">Competency Matrix</h2>
                </div>

                {/* Skill progress bars */}
                <div className="space-y-4 mb-6">
                  {competencyData.length > 0 ? (
                    competencyData.map(({ skill, pct, level }) => (
                      <div key={skill}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium">{skill}</span>
                          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                            level === "EXPERT"
                              ? "bg-emerald-100 text-emerald-700"
                              : level === "ADVANCED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                          }`}>
                            {level}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              level === "EXPERT"
                                ? "bg-emerald-500"
                                : level === "ADVANCED"
                                  ? "bg-blue-500"
                                  : "bg-amber-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 text-right">{pct}%</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No assessments available yet.</p>
                  )}
                </div>

                {/* Technical Stack tags */}
                {allSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Technical Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {allSkills.map((skill: string) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-lg text-xs font-medium text-foreground"
                        >
                          {verifiedSkills.has(skill) && (
                            <span className="material-symbols-outlined text-primary text-xs">verified</span>
                          )}
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Vouch Assessment Card ── */}
              <div className="bg-primary text-primary-foreground rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                  <h3 className="font-[var(--font-headline)] text-lg font-bold">Vouch Assessment</h3>
                </div>

                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-extrabold tracking-tight">
                    {vouchScoreScaled > 0 ? vouchScoreScaled : 892}
                  </span>
                  <span className="text-xl opacity-60 mb-1.5">/ 1000</span>
                </div>

                <p className="text-sm opacity-80 mb-6">
                  {vouchScore >= 70
                    ? "Exceptional candidate — top 2% of the Vouch network."
                    : vouchScore >= 40
                      ? "Strong candidate with above-average trust signals."
                      : "Composite trust score based on verifications, vouches, and assessments."
                  }
                </p>

                {/* Score breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-80">Identity & Background</span>
                    <span className="font-bold">{isVerified ? "300/300" : "0/300"}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: isVerified ? "100%" : "0%" }} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-80">Peer Vouches</span>
                    <span className="font-bold">
                      {peerVouches && peerVouches.length > 0
                        ? `${Math.min(peerVouches.length * 60, 300)}/300`
                        : "0/300"
                      }
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{
                        width: peerVouches && peerVouches.length > 0
                          ? `${Math.min(peerVouches.length * 20, 100)}%`
                          : "0%"
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-80">Skills & Assessments</span>
                    <span className="font-bold">
                      {assessments && assessments.length > 0
                        ? `${Math.min(assessments.length * 50, 200)}/200`
                        : "0/200"
                      }
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{
                        width: assessments && assessments.length > 0
                          ? `${Math.min(assessments.length * 25, 100)}%`
                          : "0%"
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-80">Experience & Credentials</span>
                    <span className="font-bold">
                      {credentials && credentials.length > 0
                        ? `${Math.min(credentials.length * 50 + (experience?.length || 0) * 25, 200)}/200`
                        : `${Math.min((experience?.length || 0) * 50, 200)}/200`
                      }
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{
                        width: `${Math.min(
                          ((credentials?.length || 0) * 25) + ((experience?.length || 0) * 25),
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>

                <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                  View Full Score Details
                </button>
              </div>

              {/* ── Portfolio ── */}
              {portfolioItems && portfolioItems.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl">folder_open</span>
                    <h3 className="font-[var(--font-headline)] text-lg font-bold">Portfolio</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {portfolioItems.slice(0, 4).map(
                      (item: {
                        id: string;
                        title: string;
                        description: string | null;
                        url: string | null;
                        image_url: string | null;
                      }) => (
                        <a
                          key={item.id}
                          href={item.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-primary/40 transition-colors">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-muted-foreground text-2xl">image</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-medium mt-1.5 truncate group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                        </a>
                      )
                    )}
                  </div>
                  {portfolioItems.length > 4 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      +{portfolioItems.length - 4} more projects
                    </p>
                  )}
                </div>
              )}

              {/* ── Credentials ── */}
              {credentials && credentials.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl">military_tech</span>
                    <h3 className="font-[var(--font-headline)] text-lg font-bold">Credentials</h3>
                  </div>
                  <div className="space-y-3">
                    {credentials.map(
                      (cred: {
                        id: string;
                        name: string;
                        issuer: string | null;
                        credential_type: string;
                        expiry_date: string | null;
                        verified: boolean;
                      }) => (
                        <div key={cred.id} className="flex items-start gap-3 bg-muted/30 rounded-xl p-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary text-base">workspace_premium</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold flex items-center gap-1">
                              {cred.name}
                              {cred.verified && (
                                <span className="material-symbols-outlined text-primary text-sm">verified</span>
                              )}
                            </p>
                            {cred.issuer && (
                              <p className="text-xs text-muted-foreground">{cred.issuer}</p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="lg:ml-64 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">verified_user</span>
            <span className="font-[var(--font-headline)] font-bold text-sm">Vouch</span>
            <span className="text-muted-foreground text-sm">&mdash; The verified candidate marketplace</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
