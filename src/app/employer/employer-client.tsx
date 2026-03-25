"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  MapPin,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Eye,
  X,
  Filter,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface WorkExperience {
  id: string;
  title: string;
  company: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

interface Education {
  id: string;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface Candidate {
  id: string;
  full_name: string | null;
  email: string;
  headline: string | null;
  summary: string | null;
  location: string | null;
  skills: string[] | null;
  avatar_url: string | null;
  verification_status: string;
  verification_expires_at: string | null;
  public_slug: string | null;
  work_experience: WorkExperience[];
  education: Education[];
}

interface EmployerProfile {
  id: string;
  full_name: string | null;
  subscription_tier?: string | null;
  monthly_search_limit?: number | null;
  searches_used_this_month?: number | null;
}

interface EmployerClientProps {
  user: User;
  profile: EmployerProfile;
  candidates: Candidate[];
  savedCandidateIds: string[];
}

/* ─── Material Icon helper ─── */
function MIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: "inherit" }}
    >
      {name}
    </span>
  );
}

export default function EmployerClient({
  user,
  profile,
  candidates,
  savedCandidateIds: initialSavedIds,
}: EmployerClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const supabase = createClient();

  const tier = profile.subscription_tier ?? "free";
  const searchLimit = profile.monthly_search_limit ?? 50;
  const searchesUsed = profile.searches_used_this_month ?? 0;

  // Derive unique locations and skills for filter options
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    candidates.forEach((c) => {
      if (c.location) locs.add(c.location);
    });
    return Array.from(locs).sort();
  }, [candidates]);

  const uniqueSkills = useMemo(() => {
    const skills = new Set<string>();
    candidates.forEach((c) => {
      c.skills?.forEach((s) => skills.add(s));
    });
    return Array.from(skills).sort();
  }, [candidates]);

  // Client-side filtering
  const filteredCandidates = useMemo(() => {
    let results = [...candidates];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q) ||
          c.headline?.toLowerCase().includes(q) ||
          c.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Location filter
    if (locationFilter !== "all") {
      results = results.filter((c) => c.location === locationFilter);
    }

    // Skill filter
    if (skillFilter !== "all") {
      results = results.filter((c) => c.skills?.includes(skillFilter));
    }

    // Sort
    if (sortBy === "name") {
      results.sort((a, b) =>
        (a.full_name ?? "").localeCompare(b.full_name ?? "")
      );
    }
    // "recent" is default order from server (by updated_at desc)

    return results;
  }, [candidates, searchQuery, locationFilter, skillFilter, sortBy]);

  const savedCandidates = useMemo(
    () => candidates.filter((c) => savedIds.includes(c.id)),
    [candidates, savedIds]
  );

  async function toggleSave(candidateId: string) {
    const isSaved = savedIds.includes(candidateId);

    if (isSaved) {
      setSavedIds((prev) => prev.filter((id) => id !== candidateId));
      const { error } = await supabase
        .from("saved_candidates")
        .delete()
        .eq("employer_id", user.id)
        .eq("candidate_profile_id", candidateId);
      if (error) {
        setSavedIds((prev) => [...prev, candidateId]);
        toast.error("Failed to unsave candidate");
      }
    } else {
      setSavedIds((prev) => [...prev, candidateId]);
      const { error } = await supabase.from("saved_candidates").insert({
        employer_id: user.id,
        candidate_profile_id: candidateId,
      });
      if (error) {
        setSavedIds((prev) => prev.filter((id) => id !== candidateId));
        toast.error("Failed to save candidate");
      }
    }
  }

  function openDetail(candidate: Candidate) {
    setSelectedCandidate(candidate);
    setDetailOpen(true);
  }

  function getTierBadgeColor(t: string) {
    switch (t.toLowerCase()) {
      case "pro":
        return "bg-violet-500/20 text-violet-400 border-violet-500/30";
      case "starter":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  }

  function getInitial(name: string | null) {
    return name ? name.charAt(0).toUpperCase() : "?";
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "profile", label: "Profile", icon: "person" },
    { key: "resume", label: "Resume", icon: "description" },
    { key: "verify", label: "Verify", icon: "verified_user" },
    { key: "matches", label: "Job Matches", icon: "work" },
    { key: "analytics", label: "Analytics", icon: "analytics" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* ─── Sidebar Navigation ─── */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#faf9f5] border-r border-border flex flex-col z-30">
        {/* Logo */}
        <div className="px-6 pt-7 pb-6">
          <h2 className="text-2xl font-[var(--font-headline)] font-extrabold text-primary tracking-tight">
            Vouch
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeNav === item.key
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px" }}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-4 space-y-2">
          {/* Vouch for a Peer */}
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px" }}
            >
              handshake
            </span>
            Vouch for a Peer
          </button>

          <Separator className="my-2" />

          {/* Settings & Support */}
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px" }}
            >
              settings
            </span>
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px" }}
            >
              support_agent
            </span>
            Support
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-8 py-4 flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                style={{ fontSize: "20px" }}
              >
                search
              </span>
              <Input
                placeholder="Search candidates, skills, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-none"
              />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={getTierBadgeColor(tier)}
              >
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
              </Badge>
              <span className="text-xs text-muted-foreground">
                {searchLimit - searchesUsed} searches left
              </span>
              {/* User Avatar */}
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {getInitial(profile.full_name)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-[var(--font-headline)] font-extrabold text-primary">
              Hiring Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Your recruitment health at a glance. Verified talent, real
              results.
            </p>
          </div>

          {/* ─── Metrics Bento Grid ─── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Verified Candidates Found */}
            <Card className="bg-card border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: "28px" }}
                  >
                    verified_user
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                    +12%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Verified Candidates Found
                </p>
                <p className="text-3xl font-[var(--font-headline)] font-extrabold text-foreground mt-1">
                  1,284
                </p>
              </CardContent>
            </Card>

            {/* Cost Savings */}
            <Card className="bg-card border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: "28px" }}
                  >
                    savings
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Cost Savings
                </p>
                <p className="text-3xl font-[var(--font-headline)] font-extrabold text-foreground mt-1">
                  $42,500
                </p>
              </CardContent>
            </Card>

            {/* Time to Hire */}
            <Card className="bg-card border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: "28px" }}
                  >
                    schedule
                  </span>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                    -4 days
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Time to Hire
                </p>
                <p className="text-3xl font-[var(--font-headline)] font-extrabold text-foreground mt-1">
                  18 Days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ─── Main Content Split: 2/3 + 1/3 ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shortlisted Talent */}
              <Card className="bg-card border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-[var(--font-headline)] font-bold text-foreground">
                      Shortlisted Talent
                    </h2>
                    <div className="flex items-center gap-2">
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger className="w-[150px] h-8 text-xs">
                          <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {uniqueLocations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={skillFilter} onValueChange={setSkillFilter}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <Filter className="w-3 h-3 mr-1 text-muted-foreground" />
                          <SelectValue placeholder="Skills" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Skills</SelectItem>
                          {uniqueSkills.map((skill) => (
                            <SelectItem key={skill} value={skill}>
                              {skill}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Recent</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Tabs defaultValue="search">
                    <TabsList className="mb-4">
                      <TabsTrigger value="search" className="text-xs">
                        <Search className="w-3.5 h-3.5 mr-1" />
                        All ({filteredCandidates.length})
                      </TabsTrigger>
                      <TabsTrigger value="saved" className="text-xs">
                        <BookmarkCheck className="w-3.5 h-3.5 mr-1" />
                        Saved ({savedIds.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="mt-0">
                      {filteredCandidates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
                          <p className="text-muted-foreground text-sm font-medium">
                            No candidates match your filters
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Try adjusting your search or filter criteria
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {filteredCandidates.slice(0, 8).map((candidate) => (
                            <CandidateRow
                              key={candidate.id}
                              candidate={candidate}
                              isSaved={savedIds.includes(candidate.id)}
                              onToggleSave={() => toggleSave(candidate.id)}
                              onViewProfile={() => openDetail(candidate)}
                              getInitial={getInitial}
                            />
                          ))}
                          {filteredCandidates.length > 8 && (
                            <div className="pt-3 text-center">
                              <Button variant="outline" size="sm" className="text-xs">
                                View all {filteredCandidates.length} candidates
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="saved" className="mt-0">
                      {savedCandidates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Bookmark className="w-10 h-10 text-muted-foreground/40 mb-3" />
                          <p className="text-muted-foreground text-sm font-medium">
                            No saved candidates yet
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Bookmark candidates to see them here
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {savedCandidates.map((candidate) => (
                            <CandidateRow
                              key={candidate.id}
                              candidate={candidate}
                              isSaved={true}
                              onToggleSave={() => toggleSave(candidate.id)}
                              onViewProfile={() => openDetail(candidate)}
                              getInitial={getInitial}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Marketplace Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Market Trends */}
                <Card className="bg-primary-container border-none">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="material-symbols-outlined text-primary-foreground"
                        style={{ fontSize: "22px" }}
                      >
                        trending_up
                      </span>
                      <h3 className="text-sm font-semibold text-primary-foreground">
                        Market Trends
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary-foreground/80">
                          Remote-first roles
                        </span>
                        <span className="text-xs font-semibold text-primary-foreground">
                          +23%
                        </span>
                      </div>
                      <div className="w-full bg-primary-foreground/20 rounded-full h-1.5">
                        <div
                          className="bg-primary-foreground h-1.5 rounded-full"
                          style={{ width: "73%" }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary-foreground/80">
                          AI/ML talent demand
                        </span>
                        <span className="text-xs font-semibold text-primary-foreground">
                          +41%
                        </span>
                      </div>
                      <div className="w-full bg-primary-foreground/20 rounded-full h-1.5">
                        <div
                          className="bg-primary-foreground h-1.5 rounded-full"
                          style={{ width: "91%" }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary-foreground/80">
                          Average salaries
                        </span>
                        <span className="text-xs font-semibold text-primary-foreground">
                          +8%
                        </span>
                      </div>
                      <div className="w-full bg-primary-foreground/20 rounded-full h-1.5">
                        <div
                          className="bg-primary-foreground h-1.5 rounded-full"
                          style={{ width: "58%" }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skill Scarcity Index */}
                <Card className="bg-card border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="material-symbols-outlined text-primary"
                        style={{ fontSize: "22px" }}
                      >
                        psychology
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">
                        Skill Scarcity Index
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { skill: "Rust Engineers", scarcity: 92 },
                        { skill: "ML Ops", scarcity: 87 },
                        { skill: "Security Architects", scarcity: 81 },
                        { skill: "Staff+ Frontend", scarcity: 74 },
                      ].map((item) => (
                        <div key={item.skill}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              {item.skill}
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              {item.scarcity}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: `${item.scarcity}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-6">
              {/* Compliance Tracker */}
              <Card className="bg-card border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{ fontSize: "22px" }}
                    >
                      policy
                    </span>
                    <h3 className="text-sm font-[var(--font-headline)] font-bold text-foreground">
                      Compliance Tracker
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {/* Warning Items */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <span
                        className="material-symbols-outlined text-amber-600 flex-shrink-0"
                        style={{ fontSize: "20px" }}
                      >
                        warning
                      </span>
                      <div>
                        <p className="text-xs font-medium text-amber-800">
                          3 candidates with expiring verifications
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          Re-verify within 14 days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <span
                        className="material-symbols-outlined text-amber-600 flex-shrink-0"
                        style={{ fontSize: "20px" }}
                      >
                        warning
                      </span>
                      <div>
                        <p className="text-xs font-medium text-amber-800">
                          EEO report due April 1
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          7 days remaining
                        </p>
                      </div>
                    </div>

                    {/* Verified Items */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span
                        className="material-symbols-outlined text-emerald-600 flex-shrink-0"
                        style={{ fontSize: "20px" }}
                      >
                        check_circle
                      </span>
                      <div>
                        <p className="text-xs font-medium text-emerald-800">
                          GDPR data handling compliant
                        </p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          Last audit: Mar 15, 2026
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span
                        className="material-symbols-outlined text-emerald-600 flex-shrink-0"
                        style={{ fontSize: "20px" }}
                      >
                        check_circle
                      </span>
                      <div>
                        <p className="text-xs font-medium text-emerald-800">
                          SOC 2 Type II certified
                        </p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          Valid through Dec 2026
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Build Your Trusted Network */}
              <Card className="bg-primary border-none overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-[var(--font-headline)] font-bold text-primary-foreground">
                      Build Your Trusted Network
                    </h3>
                    <p className="text-xs text-primary-foreground/80 mt-1 leading-relaxed">
                      Invite your team to collaborate on hiring decisions. Share
                      shortlists, compare notes, and make better offers
                      together.
                    </p>
                  </div>
                  {/* Team illustration placeholder */}
                  <div className="w-full h-28 rounded-lg bg-primary-foreground/10 flex items-center justify-center gap-3">
                    <span
                      className="material-symbols-outlined text-primary-foreground/60"
                      style={{ fontSize: "36px" }}
                    >
                      group
                    </span>
                    <span
                      className="material-symbols-outlined text-primary-foreground/40"
                      style={{ fontSize: "28px" }}
                    >
                      add_circle
                    </span>
                  </div>
                  <Button
                    className="w-full mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold text-sm"
                    onClick={() => toast.info("Team invitations coming soon")}
                  >
                    <span
                      className="material-symbols-outlined mr-2"
                      style={{ fontSize: "18px" }}
                    >
                      person_add
                    </span>
                    Invite Team Members
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border bg-muted">
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-[var(--font-headline)] font-bold text-primary">
                Vouch
              </span>
              <span className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Help Center
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* ─── Candidate Detail Modal ─── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  {selectedCandidate.avatar_url ? (
                    <img
                      src={selectedCandidate.avatar_url}
                      alt={selectedCandidate.full_name ?? "Candidate"}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {getInitial(selectedCandidate.full_name)}
                    </div>
                  )}
                  <div className="flex-1">
                    <DialogTitle className="flex items-center gap-2">
                      {selectedCandidate.full_name}
                      {selectedCandidate.verification_status === "verified" && (
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      )}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedCandidate.headline}
                    </DialogDescription>
                    {selectedCandidate.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {selectedCandidate.location}
                      </p>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              {/* Verification Details */}
              {selectedCandidate.verification_status === "verified" && (
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-emerald-500/10 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Identity Verified
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Background check and work authorization confirmed
                    </p>
                  </div>
                </div>
              )}

              {/* Summary */}
              {selectedCandidate.summary && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedCandidate.summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selectedCandidate.skills &&
                selectedCandidate.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Work Experience */}
              {selectedCandidate.work_experience?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Experience
                  </h3>
                  <div className="space-y-3">
                    {selectedCandidate.work_experience.map((exp) => (
                      <div
                        key={exp.id}
                        className="rounded-lg border px-4 py-3"
                      >
                        <p className="font-medium text-sm">{exp.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {exp.company}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {exp.start_date ?? "?"} &mdash;{" "}
                          {exp.is_current
                            ? "Present"
                            : exp.end_date ?? "?"}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedCandidate.education?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Education
                  </h3>
                  <div className="space-y-3">
                    {selectedCandidate.education.map((edu) => (
                      <div
                        key={edu.id}
                        className="rounded-lg border px-4 py-3"
                      >
                        <p className="font-medium text-sm">
                          {edu.institution}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {edu.degree}
                          {edu.field_of_study
                            ? ` in ${edu.field_of_study}`
                            : ""}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {edu.start_date ?? "?"} &mdash;{" "}
                          {edu.end_date ?? "?"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => toast.info("Contact feature coming soon")}
                  className="flex-1"
                >
                  Contact Candidate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleSave(selectedCandidate.id)}
                >
                  {savedIds.includes(selectedCandidate.id) ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 mr-1.5" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 mr-1.5" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Candidate Row Component ─── */

interface CandidateRowProps {
  candidate: Candidate;
  isSaved: boolean;
  onToggleSave: () => void;
  onViewProfile: () => void;
  getInitial: (name: string | null) => string;
}

function CandidateRow({
  candidate,
  isSaved,
  onToggleSave,
  onViewProfile,
  getInitial,
}: CandidateRowProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/60 transition-colors group">
      {/* Avatar */}
      {candidate.avatar_url ? (
        <img
          src={candidate.avatar_url}
          alt={candidate.full_name ?? "Candidate"}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
          {getInitial(candidate.full_name)}
        </div>
      )}

      {/* Name + headline */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{candidate.full_name}</p>
          {candidate.verification_status === "verified" && (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          )}
        </div>
        {candidate.headline && (
          <p className="text-xs text-muted-foreground truncate">
            {candidate.headline}
          </p>
        )}
      </div>

      {/* Status Badge */}
      {candidate.location && (
        <Badge variant="outline" className="text-[10px] hidden sm:flex">
          <MapPin className="w-2.5 h-2.5 mr-1" />
          {candidate.location}
        </Badge>
      )}

      {/* Verification Status */}
      {candidate.verification_status === "verified" && (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] hidden md:flex">
          Verified
        </Badge>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={onViewProfile}
        >
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={`h-7 w-7 p-0 ${isSaved ? "text-primary" : "text-muted-foreground"}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
        >
          {isSaved ? (
            <BookmarkCheck className="w-3.5 h-3.5" />
          ) : (
            <Bookmark className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
