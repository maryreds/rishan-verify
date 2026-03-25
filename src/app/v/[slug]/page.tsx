import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Look up by vanity_slug first, then public_slug for backward compat
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("vanity_slug", slug)
    .single();

  if (!profile) {
    const { data: fallback } = await supabase
      .from("profiles")
      .select("*")
      .eq("public_slug", slug)
      .single();
    profile = fallback;
  }

  if (!profile) {
    notFound();
  }

  const { data: experience } = await supabase
    .from("work_experience")
    .select("*")
    .eq("profile_id", profile.id)
    .order("start_date", { ascending: false });

  const { data: education } = await supabase
    .from("education")
    .select("*")
    .eq("profile_id", profile.id)
    .order("start_date", { ascending: false });

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("profile_id", profile.id);

  const { data: latestVerification } = await supabase
    .from("verification_requests")
    .select("immigration_status, status_valid_until, reviewed_at")
    .eq("profile_id", profile.id)
    .eq("status", "completed")
    .order("reviewed_at", { ascending: false })
    .limit(1)
    .single();

  // New data: portfolio, references, peer vouches, credentials
  const { data: portfolioItems } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("profile_id", profile.id)
    .order("sort_order", { ascending: true });

  const { data: completedRefs } = await supabase
    .from("references")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("status", "completed");

  const { data: peerVouches } = await supabase
    .from("peer_vouches")
    .select("*, voucher:voucher_id(full_name, photo_original_url, headline)")
    .eq("vouchee_id", profile.id)
    .eq("status", "accepted");

  const { data: credentials } = await supabase
    .from("credentials")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  const { data: assessments } = await supabase
    .from("assessments")
    .select("skill_name, score, max_score")
    .eq("profile_id", profile.id)
    .eq("status", "completed");

  const isVerified = profile.verification_status === "verified";
  const vouchScore = profile.vouch_score || 0;

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

  // Score ring SVG params
  const ringSize = 100;
  const ringStroke = 6;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = ringRadius * 2 * Math.PI;
  const ringOffset = ringCircumference - (vouchScore / 100) * ringCircumference;

  const scoreColor =
    vouchScore >= 70
      ? "var(--color-vouch-verified)"
      : vouchScore >= 40
        ? "var(--color-vouch-score)"
        : "var(--color-muted-foreground)";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
            <span className="font-[var(--font-headline)] font-bold text-lg tracking-tight">Vouch</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/candidates" className="hover:text-foreground transition-colors">Candidates</Link>
            <Link href="/employers" className="hover:text-foreground transition-colors">For Employers</Link>
            <Link href="/communities" className="hover:text-foreground transition-colors">Communities</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup?role=candidate"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* ── Main Column ── */}
          <div className="flex-1 min-w-0 space-y-10">
            {/* ── Profile Header ── */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Photo */}
                <div className="relative flex-shrink-0">
                  {profile.photo_original_url ? (
                    <img
                      src={profile.photo_original_url}
                      alt={profile.full_name || ""}
                      className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover border-4 border-background shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-5xl md:text-6xl">
                      {(profile.full_name || "?").charAt(0)}
                    </div>
                  )}
                  {/* Verified badge overlay */}
                  {isVerified && (
                    <div className="absolute bottom-1 right-1 w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                      <span className="material-symbols-outlined text-primary-foreground text-xl md:text-2xl">verified</span>
                    </div>
                  )}
                </div>

                {/* Name + title */}
                <div className="text-center sm:text-left space-y-3 pt-2">
                  <h1 className="font-[var(--font-headline)] text-4xl md:text-6xl font-extrabold tracking-tight leading-none">
                    {profile.full_name}
                  </h1>
                  {profile.headline && (
                    <p className="text-lg md:text-xl text-muted-foreground">
                      {profile.headline}
                    </p>
                  )}
                  {/* Tags row */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {profile.location && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-sm text-muted-foreground">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        {profile.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      <span className="material-symbols-outlined text-base">event_available</span>
                      Available
                    </span>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-bold tracking-wider uppercase">
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                        Vouched
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              {(profile.summary || profile.summary_ai) && (
                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {profile.summary || profile.summary_ai}
                </p>
              )}
            </section>

            {/* ── Trust Grid ── */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vouch Score Card */}
              <div className="bg-muted rounded-2xl p-6 flex items-center gap-6">
                <div className="relative flex-shrink-0" style={{ width: ringSize, height: ringSize }}>
                  <svg width={ringSize} height={ringSize} className="-rotate-90">
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={ringRadius}
                      fill="none"
                      stroke="var(--color-border)"
                      strokeWidth={ringStroke}
                    />
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={ringRadius}
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth={ringStroke}
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-extrabold">{vouchScore}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-[var(--font-headline)] text-lg font-bold">Vouch Score</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {vouchScore >= 70 ? "Top 2% of candidates" : vouchScore >= 40 ? "Above average" : "Building reputation"}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Based on verifications, vouches &amp; skills</p>
                </div>
              </div>

              {/* Verification Status Grid */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-[var(--font-headline)] text-lg font-bold mb-4">Verification Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Identity */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isVerified ? "bg-primary/10" : "bg-muted"}`}>
                      <span className={`material-symbols-outlined text-xl ${isVerified ? "text-primary" : "text-muted-foreground"}`}>badge</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Identity</p>
                      <p className={`text-xs ${isVerified ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {isVerified ? "Verified" : "Pending"}
                      </p>
                    </div>
                  </div>

                  {/* Work Auth */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${latestVerification?.immigration_status ? "bg-primary/10" : "bg-muted"}`}>
                      <span className={`material-symbols-outlined text-xl ${latestVerification?.immigration_status ? "text-primary" : "text-muted-foreground"}`}>work</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Work Auth</p>
                      <p className={`text-xs ${latestVerification?.immigration_status ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {latestVerification?.immigration_status || "Pending"}
                      </p>
                    </div>
                  </div>

                  {/* Background */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isVerified ? "bg-primary/10" : "bg-muted"}`}>
                      <span className={`material-symbols-outlined text-xl ${isVerified ? "text-primary" : "text-muted-foreground"}`}>shield</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Background</p>
                      <p className={`text-xs ${isVerified ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {isVerified ? "Clear" : "Pending"}
                      </p>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${education && education.length > 0 ? "bg-primary/10" : "bg-muted"}`}>
                      <span className={`material-symbols-outlined text-xl ${education && education.length > 0 ? "text-primary" : "text-muted-foreground"}`}>school</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Education</p>
                      <p className={`text-xs ${education && education.length > 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {education && education.length > 0 ? "Verified" : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Video Intro ── */}
            {profile.video_intro_url && (
              <section>
                <h2 className="font-[var(--font-headline)] text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">play_circle</span>
                  Video Introduction
                </h2>
                <div className="rounded-2xl overflow-hidden border border-border bg-card">
                  <video
                    src={profile.video_intro_url}
                    controls
                    className="w-full max-h-[400px]"
                    preload="metadata"
                  />
                </div>
              </section>
            )}

            {/* ── Verified Experience ── */}
            {experience && experience.length > 0 && (
              <section>
                <h2 className="font-[var(--font-headline)] text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">work_history</span>
                  Verified Experience
                </h2>
                <div className="relative pl-8">
                  {/* Timeline line */}
                  <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border" />

                  <div className="space-y-8">
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
                          {/* Timeline dot */}
                          <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-sm">apartment</span>
                          </div>

                          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-base">{exp.title}</h3>
                                <p className="text-sm text-muted-foreground font-medium">{exp.company}</p>
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
                              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── Education ── */}
            {education && education.length > 0 && (
              <section>
                <h2 className="font-[var(--font-headline)] text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">school</span>
                  Education
                </h2>
                <div className="space-y-4">
                  {education.map(
                    (edu: {
                      id: string;
                      institution: string;
                      degree: string | null;
                      field_of_study: string | null;
                      start_date: string | null;
                      end_date: string | null;
                    }) => (
                      <div
                        key={edu.id}
                        className="bg-card border border-border rounded-xl p-5"
                      >
                        <p className="font-semibold text-base">{edu.institution}</p>
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
              </section>
            )}

            {/* ── Credentials ── */}
            {credentials && credentials.length > 0 && (
              <section>
                <h2 className="font-[var(--font-headline)] text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">military_tech</span>
                  Credentials
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {credentials.map(
                    (cred: {
                      id: string;
                      name: string;
                      issuer: string | null;
                      credential_type: string;
                      expiry_date: string | null;
                      verified: boolean;
                    }) => (
                      <div
                        key={cred.id}
                        className="bg-card border border-border rounded-xl p-4 flex items-start gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-primary">workspace_premium</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-1.5">
                            {cred.name}
                            {cred.verified && (
                              <span className="material-symbols-outlined text-primary text-sm">verified</span>
                            )}
                          </p>
                          {cred.issuer && (
                            <p className="text-xs text-muted-foreground">{cred.issuer}</p>
                          )}
                          {cred.expiry_date && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                              Expires:{" "}
                              {new Date(cred.expiry_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* ── Peer Vouches ── */}
            {peerVouches && peerVouches.length > 0 && (
              <section>
                <h2 className="font-[var(--font-headline)] text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">thumb_up</span>
                  Peer Vouches
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {peerVouches.map(
                    (vouch: {
                      id: string;
                      message: string;
                      skill: string | null;
                      voucher_score: number | null;
                      voucher: { full_name: string | null; photo_original_url: string | null; headline: string | null } | null;
                    }) => (
                      <div
                        key={vouch.id}
                        className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
                      >
                        <p className="text-sm text-foreground leading-relaxed italic">
                          &ldquo;{vouch.message}&rdquo;
                        </p>
                        {vouch.skill && (
                          <span className="inline-block mt-3 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {vouch.skill}
                          </span>
                        )}
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                          {vouch.voucher?.photo_original_url ? (
                            <img
                              src={vouch.voucher.photo_original_url}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                              {(vouch.voucher?.full_name || "?").charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {vouch.voucher?.full_name || "Verified Professional"}
                            </p>
                            {vouch.voucher?.headline && (
                              <p className="text-xs text-muted-foreground truncate">
                                {vouch.voucher.headline}
                              </p>
                            )}
                          </div>
                          {vouch.voucher_score && vouch.voucher_score >= 70 && (
                            <span className="text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full flex-shrink-0">
                              {vouch.voucher_score}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* ── References ── */}
            {completedRefs && completedRefs.length > 0 && (
              <section>
                <h2 className="font-[var(--font-headline)] text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">group</span>
                  References
                </h2>
                <div className="space-y-3">
                  {completedRefs.map(
                    (ref: {
                      id: string;
                      referee_name: string;
                      referee_title: string | null;
                      referee_company: string | null;
                      relationship: string | null;
                      responses: Record<string, unknown> | null;
                    }) => (
                      <div
                        key={ref.id}
                        className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                          {ref.referee_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{ref.referee_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ref.referee_title}
                            {ref.referee_company ? ` at ${ref.referee_company}` : ""}
                            {ref.relationship ? ` · ${ref.relationship}` : ""}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Portable Identity Card */}
            <div className="bg-primary text-primary-foreground rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl">qr_code_2</span>
                <h3 className="font-[var(--font-headline)] font-bold text-lg">Portable Identity</h3>
              </div>

              {/* QR code placeholder */}
              <div className="bg-white/10 rounded-xl p-4 flex items-center justify-center">
                <div className="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl opacity-60">qr_code_2</span>
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full py-2.5 bg-white text-primary font-semibold rounded-xl text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Hire via Vouch
                </button>
                <button className="w-full py-2.5 bg-white/15 text-primary-foreground font-medium rounded-xl text-sm hover:bg-white/25 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">link</span>
                  Copy Profile Link
                </button>
              </div>
            </div>

            {/* Skills & Expertise */}
            {allSkills.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-[var(--font-headline)] font-bold text-base mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                  Skills &amp; Expertise
                </h3>
                <div className="space-y-3">
                  {allSkills.slice(0, 8).map((skill: string) => {
                    const isSkillVerified = verifiedSkills.has(skill);
                    const assessment = assessments?.find(
                      (a: { skill_name: string; score: number; max_score: number }) => a.skill_name === skill
                    );
                    const pct = assessment
                      ? Math.round((assessment.score / assessment.max_score) * 100)
                      : isSkillVerified
                        ? 85
                        : 60;

                    return (
                      <div key={skill}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium flex items-center gap-1.5">
                            {skill}
                            {isSkillVerified && (
                              <span className="material-symbols-outlined text-primary text-sm">verified</span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Portfolio Thumbnails */}
            {portfolioItems && portfolioItems.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-[var(--font-headline)] font-bold text-base mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">folder_open</span>
                  Portfolio
                </h3>
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
          </aside>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
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
