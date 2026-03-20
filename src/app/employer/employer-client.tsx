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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Users className="w-6 h-6" />
                Candidate Marketplace
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse verified candidates ready to hire
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={getTierBadgeColor(tier)}
              >
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
              </Badge>
              <span className="text-xs text-muted-foreground">
                {searchLimit - searchesUsed} searches remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs defaultValue="search">
          <TabsList>
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-1.5" />
              Search
            </TabsTrigger>
            <TabsTrigger value="saved">
              <BookmarkCheck className="w-4 h-4 mr-1.5" />
              Saved ({savedIds.length})
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, headline, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <MapPin className="w-4 h-4 mr-1.5 text-muted-foreground" />
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
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-1.5 text-muted-foreground" />
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
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Verified</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Grid */}
            {filteredCandidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-medium">
                  No candidates match your filters
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isSaved={savedIds.includes(candidate.id)}
                    onToggleSave={() => toggleSave(candidate.id)}
                    onViewProfile={() => openDetail(candidate)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved" className="mt-6">
            {savedCandidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Bookmark className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-medium">
                  No saved candidates yet
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Bookmark candidates from the search tab to see them here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isSaved={true}
                    onToggleSave={() => toggleSave(candidate.id)}
                    onViewProfile={() => openDetail(candidate)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Candidate Detail Modal */}
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

// --- Candidate Card Component ---

interface CandidateCardProps {
  candidate: Candidate;
  isSaved: boolean;
  onToggleSave: () => void;
  onViewProfile: () => void;
}

function CandidateCard({
  candidate,
  isSaved,
  onToggleSave,
  onViewProfile,
}: CandidateCardProps) {
  function getInitial(name: string | null) {
    return name ? name.charAt(0).toUpperCase() : "?";
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {candidate.avatar_url ? (
            <img
              src={candidate.avatar_url}
              alt={candidate.full_name ?? "Candidate"}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg flex-shrink-0">
              {getInitial(candidate.full_name)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm truncate">
                {candidate.full_name}
              </h3>
              {candidate.verification_status === "verified" && (
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
            </div>
            {candidate.headline && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {candidate.headline}
              </p>
            )}
            {candidate.location && (
              <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {candidate.location}
              </p>
            )}
          </div>
        </div>

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {candidate.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[10px]">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 4 && (
              <Badge variant="outline" className="text-[10px]">
                +{candidate.skills.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onViewProfile}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View Profile
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className={isSaved ? "text-primary" : "text-muted-foreground"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
