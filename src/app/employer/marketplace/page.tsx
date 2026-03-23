"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  MapPin,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Eye,
  Filter,
  Users,
  Star,
  Clock,
  TrendingUp,
  BarChart3,
  FileCheck,
  Fingerprint,
  Scale,
  Award,
  MessageSquare,
  ArrowRight,
  Mail,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VouchLogo } from "@/components/vouch/vouch-logo";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  full_name: string;
  email: string;
  headline: string;
  summary: string;
  location: string;
  skills: string[];
  avatar_url: string;
  verification_status: "verified";
  verified_at: string;
  verification_expires_at: string;
  public_slug: string;
  work_experience: WorkExperience[];
  education: Education[];
  verification_pillars: {
    identity: boolean;
    work_auth: boolean;
    background: boolean;
    credentials: boolean;
    references: boolean;
  };
}

// ---------------------------------------------------------------------------
// Placeholder candidate data
// ---------------------------------------------------------------------------

const PLACEHOLDER_CANDIDATES: Candidate[] = [
  {
    id: "1",
    full_name: "Priya Venkatesh",
    email: "priya.v@example.com",
    headline: "Senior Full-Stack Engineer",
    summary:
      "8+ years building scalable web applications with React, Node.js, and AWS. Passionate about clean architecture and mentoring junior engineers. Led a team of 6 at Zenith Labs through a full platform rewrite that improved performance by 40%.",
    location: "Dallas, TX",
    skills: ["React", "TypeScript", "Node.js", "AWS", "PostgreSQL", "GraphQL", "Docker"],
    avatar_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-02-15",
    verification_expires_at: "2027-02-15",
    public_slug: "priya-venkatesh",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: true, references: true },
    work_experience: [
      { id: "w1", title: "Senior Full-Stack Engineer", company: "Zenith Labs", start_date: "2023-01", end_date: null, is_current: true, description: "Led platform rewrite from monolith to microservices. Improved API response times by 40%." },
      { id: "w2", title: "Software Engineer II", company: "Cloudway Inc.", start_date: "2020-03", end_date: "2022-12", is_current: false, description: "Built real-time data pipeline serving 2M events/day." },
      { id: "w3", title: "Junior Developer", company: "StartupGrid", start_date: "2018-06", end_date: "2020-02", is_current: false, description: "Full-stack development for e-commerce platform." },
    ],
    education: [
      { id: "e1", institution: "University of Texas at Dallas", degree: "M.S.", field_of_study: "Computer Science", start_date: "2016", end_date: "2018" },
      { id: "e2", institution: "Anna University, Chennai", degree: "B.E.", field_of_study: "Information Technology", start_date: "2012", end_date: "2016" },
    ],
  },
  {
    id: "2",
    full_name: "Marcus Thompson",
    email: "marcus.t@example.com",
    headline: "Lead Backend Engineer",
    summary:
      "10 years of backend engineering with expertise in distributed systems and cloud infrastructure. Built payment processing systems handling $500M+ annually. Strong background in system design and performance optimization.",
    location: "Atlanta, GA",
    skills: ["Java", "Spring Boot", "Kubernetes", "AWS", "Kafka", "PostgreSQL", "Terraform"],
    avatar_url: "https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-01-20",
    verification_expires_at: "2027-01-20",
    public_slug: "marcus-thompson",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: true, references: true },
    work_experience: [
      { id: "w4", title: "Lead Backend Engineer", company: "FinCore Systems", start_date: "2022-06", end_date: null, is_current: true, description: "Architected payment processing system handling $500M+ annually across 12 microservices." },
      { id: "w5", title: "Senior Software Engineer", company: "DataPulse", start_date: "2019-01", end_date: "2022-05", is_current: false, description: "Built real-time analytics pipeline processing 10TB/day." },
    ],
    education: [
      { id: "e3", institution: "Georgia Institute of Technology", degree: "M.S.", field_of_study: "Computer Science", start_date: "2014", end_date: "2016" },
    ],
  },
  {
    id: "3",
    full_name: "Sofia Rivera",
    email: "sofia.r@example.com",
    headline: "UX / UI Designer & Design Systems Lead",
    summary:
      "Award-winning product designer with 7 years of experience. Specialize in design systems, accessibility, and user research. Reduced onboarding drop-off by 35% at Meridian through research-driven redesign.",
    location: "Austin, TX",
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Accessibility", "HTML/CSS", "React"],
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-03-01",
    verification_expires_at: "2027-03-01",
    public_slug: "sofia-rivera",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: false, references: true },
    work_experience: [
      { id: "w6", title: "Design Systems Lead", company: "Meridian Health", start_date: "2023-03", end_date: null, is_current: true, description: "Built and maintained component library used by 40+ engineers. Reduced design-to-dev handoff time by 60%." },
      { id: "w7", title: "Senior UX Designer", company: "ShopEasy", start_date: "2020-08", end_date: "2023-02", is_current: false, description: "Led checkout redesign that increased conversion by 22%." },
    ],
    education: [
      { id: "e4", institution: "Rhode Island School of Design", degree: "B.F.A.", field_of_study: "Graphic Design", start_date: "2015", end_date: "2019" },
    ],
  },
  {
    id: "4",
    full_name: "Arjun Patel",
    email: "arjun.p@example.com",
    headline: "Cloud Architect & DevOps Lead",
    summary:
      "12 years in infrastructure and cloud engineering. AWS Solutions Architect Professional certified. Migrated 200+ services to Kubernetes, reducing infrastructure costs by 45%. Speaker at KubeCon 2025.",
    location: "San Jose, CA",
    skills: ["AWS", "Kubernetes", "Terraform", "Python", "CI/CD", "Docker", "Linux", "Ansible"],
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-02-28",
    verification_expires_at: "2027-02-28",
    public_slug: "arjun-patel",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: true, references: true },
    work_experience: [
      { id: "w8", title: "Cloud Architect", company: "NovaTech Solutions", start_date: "2022-01", end_date: null, is_current: true, description: "Lead cloud strategy for Fortune 500 clients. Migrated 200+ services to K8s." },
      { id: "w9", title: "Senior DevOps Engineer", company: "ScaleRight", start_date: "2018-05", end_date: "2021-12", is_current: false, description: "Built zero-downtime deployment pipeline serving 50M users." },
    ],
    education: [
      { id: "e5", institution: "Stanford University", degree: "M.S.", field_of_study: "Computer Engineering", start_date: "2012", end_date: "2014" },
    ],
  },
  {
    id: "5",
    full_name: "Aisha Davis",
    email: "aisha.d@example.com",
    headline: "Product Designer",
    summary:
      "Creative product designer with a background in human-computer interaction. 5 years designing consumer and enterprise products. Focused on inclusive design and building delightful user experiences.",
    location: "Chicago, IL",
    skills: ["Figma", "Prototyping", "User Research", "Interaction Design", "Sketch", "Storyboarding"],
    avatar_url: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-03-10",
    verification_expires_at: "2027-03-10",
    public_slug: "aisha-davis",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: false, references: true },
    work_experience: [
      { id: "w10", title: "Product Designer", company: "Luminary Apps", start_date: "2023-06", end_date: null, is_current: true, description: "Designing consumer mobile app with 1.2M MAU. Led redesign that boosted retention by 18%." },
      { id: "w11", title: "UX Designer", company: "BrightPath Education", start_date: "2021-02", end_date: "2023-05", is_current: false, description: "Designed K-12 learning platform used by 500+ schools." },
    ],
    education: [
      { id: "e6", institution: "Carnegie Mellon University", degree: "M.S.", field_of_study: "Human-Computer Interaction", start_date: "2019", end_date: "2021" },
    ],
  },
  {
    id: "6",
    full_name: "Jenny Liu",
    email: "jenny.l@example.com",
    headline: "Senior Data Scientist",
    summary:
      "6 years in data science and machine learning. Built recommendation engines, fraud detection models, and NLP pipelines. Published researcher with 3 papers in top-tier conferences.",
    location: "New York, NY",
    skills: ["Python", "PyTorch", "SQL", "Spark", "NLP", "Computer Vision", "MLOps", "Airflow"],
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-02-01",
    verification_expires_at: "2027-02-01",
    public_slug: "jenny-liu",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: true, references: true },
    work_experience: [
      { id: "w12", title: "Senior Data Scientist", company: "Quantive Analytics", start_date: "2023-01", end_date: null, is_current: true, description: "Built fraud detection model saving $12M/year. Lead team of 4 data scientists." },
      { id: "w13", title: "Data Scientist", company: "RetailAI", start_date: "2020-06", end_date: "2022-12", is_current: false, description: "Developed recommendation engine increasing basket size by 15%." },
    ],
    education: [
      { id: "e7", institution: "Columbia University", degree: "M.S.", field_of_study: "Data Science", start_date: "2018", end_date: "2020" },
    ],
  },
  {
    id: "7",
    full_name: "Ryan Mitchell",
    email: "ryan.m@example.com",
    headline: "ML Engineer",
    summary:
      "Machine learning engineer specializing in production ML systems. Built and deployed models serving 100M+ predictions/day. Strong background in MLOps, model monitoring, and A/B testing infrastructure.",
    location: "Seattle, WA",
    skills: ["Python", "TensorFlow", "Kubernetes", "Go", "MLOps", "Feature Stores", "A/B Testing"],
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-01-15",
    verification_expires_at: "2027-01-15",
    public_slug: "ryan-mitchell",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: true, references: false },
    work_experience: [
      { id: "w14", title: "ML Engineer", company: "Apex AI", start_date: "2022-09", end_date: null, is_current: true, description: "Built real-time inference pipeline serving 100M+ predictions/day at <50ms latency." },
      { id: "w15", title: "Software Engineer — ML Platform", company: "TechGiant Corp", start_date: "2019-03", end_date: "2022-08", is_current: false, description: "Developed feature store and model registry used by 200+ data scientists." },
    ],
    education: [
      { id: "e8", institution: "University of Washington", degree: "M.S.", field_of_study: "Computer Science (ML)", start_date: "2017", end_date: "2019" },
    ],
  },
  {
    id: "8",
    full_name: "Natalia Gomez",
    email: "natalia.g@example.com",
    headline: "Engineering Manager",
    summary:
      "Engineering leader with 10+ years of experience, 5 in management. Scaled teams from 4 to 20 engineers. Track record of shipping complex features on time while maintaining high team satisfaction scores.",
    location: "Houston, TX",
    skills: ["Team Leadership", "Agile", "System Design", "Java", "React", "Project Management", "Mentoring"],
    avatar_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-03-05",
    verification_expires_at: "2027-03-05",
    public_slug: "natalia-gomez",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: true, references: true },
    work_experience: [
      { id: "w16", title: "Engineering Manager", company: "Orbit Health", start_date: "2022-04", end_date: null, is_current: true, description: "Manage 3 squads (20 engineers). Shipped HIPAA-compliant telehealth platform." },
      { id: "w17", title: "Senior Software Engineer → Tech Lead", company: "PayBridge", start_date: "2017-01", end_date: "2022-03", is_current: false, description: "Promoted from IC to tech lead. Led payments integration serving 5M transactions/month." },
    ],
    education: [
      { id: "e9", institution: "Rice University", degree: "B.S.", field_of_study: "Computer Science", start_date: "2013", end_date: "2017" },
    ],
  },
  {
    id: "9",
    full_name: "Kevin Park",
    email: "kevin.p@example.com",
    headline: "Solutions Architect",
    summary:
      "Solutions architect bridging business and engineering. 9 years designing enterprise integrations, API platforms, and migration strategies. AWS and Azure certified.",
    location: "Dallas, TX",
    skills: ["AWS", "Azure", "Solution Design", "API Design", "Microservices", "Enterprise Integration", "SQL Server"],
    avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-02-20",
    verification_expires_at: "2027-02-20",
    public_slug: "kevin-park",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: true, references: true },
    work_experience: [
      { id: "w18", title: "Solutions Architect", company: "ConsultPrime", start_date: "2021-08", end_date: null, is_current: true, description: "Design and deliver enterprise architecture for Fortune 1000 clients." },
      { id: "w19", title: "Senior Software Engineer", company: "Integra Systems", start_date: "2017-04", end_date: "2021-07", is_current: false, description: "Built API gateway handling 50K req/s for healthcare platform." },
    ],
    education: [
      { id: "e10", institution: "University of Michigan", degree: "B.S.", field_of_study: "Computer Engineering", start_date: "2013", end_date: "2017" },
    ],
  },
  {
    id: "10",
    full_name: "Imani Carter",
    email: "imani.c@example.com",
    headline: "DevSecOps Engineer",
    summary:
      "Security-focused DevOps engineer with 6 years hardening CI/CD pipelines and cloud infrastructure. Built security automation that reduced vulnerability remediation time from 14 days to 48 hours.",
    location: "Washington, DC",
    skills: ["Security", "AWS", "Terraform", "Python", "Docker", "SAST/DAST", "Compliance", "CI/CD"],
    avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-03-12",
    verification_expires_at: "2027-03-12",
    public_slug: "imani-carter",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: true, references: true },
    work_experience: [
      { id: "w20", title: "DevSecOps Engineer", company: "SecureFirst", start_date: "2023-02", end_date: null, is_current: true, description: "Built automated security scanning pipeline. Reduced vulnerability remediation time by 75%." },
      { id: "w21", title: "DevOps Engineer", company: "GovTech Solutions", start_date: "2020-06", end_date: "2023-01", is_current: false, description: "Managed FedRAMP-compliant infrastructure for government clients." },
    ],
    education: [
      { id: "e11", institution: "Howard University", degree: "B.S.", field_of_study: "Cybersecurity", start_date: "2016", end_date: "2020" },
    ],
  },
  {
    id: "11",
    full_name: "Rachel Williams",
    email: "rachel.w@example.com",
    headline: "Frontend Developer",
    summary:
      "Frontend specialist with 5 years building accessible, performant web applications. Core contributor to an open-source component library with 8K+ GitHub stars.",
    location: "Portland, OR",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Accessibility", "Performance", "Storybook"],
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-02-10",
    verification_expires_at: "2027-02-10",
    public_slug: "rachel-williams",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: false, references: true },
    work_experience: [
      { id: "w22", title: "Frontend Developer", company: "PixelCraft Studio", start_date: "2023-04", end_date: null, is_current: true, description: "Building design system and component library for SaaS platform. Improved Lighthouse score from 62 to 97." },
      { id: "w23", title: "Junior Frontend Developer", company: "WebFlow Agency", start_date: "2021-01", end_date: "2023-03", is_current: false, description: "Built responsive web apps for 20+ clients across healthcare and fintech." },
    ],
    education: [
      { id: "e12", institution: "Oregon State University", degree: "B.S.", field_of_study: "Computer Science", start_date: "2017", end_date: "2021" },
    ],
  },
  {
    id: "12",
    full_name: "Vikram Nair",
    email: "vikram.n@example.com",
    headline: "Full-Stack Engineer",
    summary:
      "Versatile full-stack engineer comfortable across the entire stack. 7 years shipping production features in fast-paced startups. Strong communicator who thrives in cross-functional teams.",
    location: "San Francisco, CA",
    skills: ["TypeScript", "React", "Node.js", "Python", "PostgreSQL", "Redis", "Docker", "GCP"],
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=320&h=320&fit=crop&crop=face",
    verification_status: "verified",
    verified_at: "2026-01-25",
    verification_expires_at: "2027-01-25",
    public_slug: "vikram-nair",
    verification_pillars: { identity: true, work_auth: true, background: true, credentials: false, references: true },
    work_experience: [
      { id: "w24", title: "Full-Stack Engineer", company: "LaunchPad Ventures", start_date: "2022-07", end_date: null, is_current: true, description: "Core engineer at Series A startup. Built billing system, admin dashboard, and public API." },
      { id: "w25", title: "Software Engineer", company: "Mango Health", start_date: "2019-09", end_date: "2022-06", is_current: false, description: "Built patient portal used by 200K+ users." },
    ],
    education: [
      { id: "e13", institution: "UC Berkeley", degree: "B.S.", field_of_study: "Electrical Engineering & Computer Science", start_date: "2015", end_date: "2019" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Verification pillar config
// ---------------------------------------------------------------------------

const PILLAR_CONFIG = [
  { key: "identity" as const, label: "Identity", icon: Fingerprint },
  { key: "work_auth" as const, label: "Work Auth", icon: Scale },
  { key: "background" as const, label: "Background", icon: FileCheck },
  { key: "credentials" as const, label: "Credentials", icon: Award },
  { key: "references" as const, label: "References", icon: MessageSquare },
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function EmployerMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  const candidates = PLACEHOLDER_CANDIDATES;

  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    candidates.forEach((c) => { if (c.location) locs.add(c.location); });
    return Array.from(locs).sort();
  }, [candidates]);

  const uniqueSkills = useMemo(() => {
    const skills = new Set<string>();
    candidates.forEach((c) => { c.skills?.forEach((s) => skills.add(s)); });
    return Array.from(skills).sort();
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    let results = [...candidates];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.headline.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)) ||
          c.location.toLowerCase().includes(q)
      );
    }
    if (locationFilter !== "all") results = results.filter((c) => c.location === locationFilter);
    if (skillFilter !== "all") results = results.filter((c) => c.skills.includes(skillFilter));
    if (sortBy === "name") results.sort((a, b) => a.full_name.localeCompare(b.full_name));
    return results;
  }, [candidates, searchQuery, locationFilter, skillFilter, sortBy]);

  const savedCandidates = useMemo(() => candidates.filter((c) => savedIds.includes(c.id)), [candidates, savedIds]);

  function toggleSave(id: string) {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function openDetail(candidate: Candidate) {
    setSelectedCandidate(candidate);
    setDetailOpen(true);
  }

  function pillarCount(pillars: Candidate["verification_pillars"]) {
    return Object.values(pillars).filter(Boolean).length;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* ─── Top Nav ─── */}
        <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
          <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <VouchLogo size="lg" href="/" />
              <div className="hidden sm:flex h-6 w-px bg-border" />
              <span className="hidden sm:block text-sm font-medium tracking-tight text-foreground">
                Talent Marketplace
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/8 text-primary border-primary/20 font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                Pro
              </Badge>
              <Link href="/signup?role=employer">
                <Button size="sm" variant="default" className="rounded-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* ─── Hero / KPI Strip ─── */}
        <div className="border-b bg-gradient-to-b from-primary/[0.03] to-transparent">
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <div className="flex flex-col gap-1 mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Talent Marketplace
              </h1>
              <p className="text-base text-muted-foreground max-w-xl">
                Pre-verified professionals ready to hire. Every candidate passes our 5-pillar verification.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Verified Talent", value: "12", icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/8" },
                { label: "Avg. Vouch Score", value: "4.6", suffix: "/ 5", icon: Star, color: "text-amber-500", bg: "bg-amber-500/8" },
                { label: "Avg. Time to Hire", value: "3.2", suffix: "days", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/8" },
                { label: "Added This Week", value: "+4", icon: TrendingUp, color: "text-primary", bg: "bg-primary/8" },
              ].map(({ label, value, suffix, icon: Icon, color, bg }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold tracking-tight">{value}</span>
                      {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-none mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Main Content ─── */}
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-muted/60">
                <TabsTrigger value="search" className="data-[state=active]:bg-background">
                  <Search className="w-4 h-4 mr-1.5" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="saved" className="data-[state=active]:bg-background">
                  <BookmarkCheck className="w-4 h-4 mr-1.5" />
                  Saved
                  {savedIds.length > 0 && (
                    <span className="ml-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {savedIds.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-background">
                  <BarChart3 className="w-4 h-4 mr-1.5" />
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ═══ Search Tab ═══ */}
            <TabsContent value="search" className="mt-0">
              {/* Search bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, role, skills, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-card"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-full sm:w-[170px] h-11 bg-card">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {uniqueLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={skillFilter} onValueChange={setSkillFilter}>
                    <SelectTrigger className="w-full sm:w-[170px] h-11 bg-card">
                      <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <SelectValue placeholder="Skills" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      {uniqueSkills.map((skill) => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[155px] h-11 bg-card">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recently Verified</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredCandidates.length} verified professional{filteredCandidates.length !== 1 ? "s" : ""}
                </p>
                {(searchQuery || locationFilter !== "all" || skillFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => { setSearchQuery(""); setLocationFilter("all"); setSkillFilter("all"); }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>

              {/* Grid */}
              {filteredCandidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-foreground font-medium mb-1">No matches found</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Try broadening your search or adjusting filters to find more candidates.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

            {/* ═══ Saved Tab ═══ */}
            <TabsContent value="saved" className="mt-0">
              {savedCandidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Bookmark className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-foreground font-medium mb-1">No saved candidates</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Bookmark candidates while browsing to build your shortlist.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveTab("search")}>
                    <Search className="w-3.5 h-3.5 mr-1.5" />
                    Browse Talent
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

            {/* ═══ Analytics / Insights Tab ═══ */}
            <TabsContent value="analytics" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Candidates by Location */}
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Candidates by Location
                    </h3>
                    <div className="space-y-3">
                      {[
                        { loc: "Dallas, TX", count: 2, pct: 17 },
                        { loc: "San Francisco, CA", count: 1, pct: 8 },
                        { loc: "San Jose, CA", count: 1, pct: 8 },
                        { loc: "New York, NY", count: 1, pct: 8 },
                        { loc: "Seattle, WA", count: 1, pct: 8 },
                        { loc: "Austin, TX", count: 1, pct: 8 },
                        { loc: "Atlanta, GA", count: 1, pct: 8 },
                        { loc: "Other", count: 4, pct: 33 },
                      ].map(({ loc, count, pct }) => (
                        <div key={loc} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-36 truncate">{loc}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary/70 transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-medium tabular-nums w-5 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Skills */}
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Top Skills in Pool
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { skill: "React", count: 4 },
                        { skill: "AWS", count: 4 },
                        { skill: "Python", count: 4 },
                        { skill: "TypeScript", count: 3 },
                        { skill: "Docker", count: 3 },
                        { skill: "Kubernetes", count: 3 },
                        { skill: "Node.js", count: 2 },
                        { skill: "PostgreSQL", count: 2 },
                        { skill: "Figma", count: 2 },
                        { skill: "Terraform", count: 2 },
                      ].map(({ skill, count }) => (
                        <button
                          key={skill}
                          onClick={() => { setSkillFilter(skill); setActiveTab("search"); }}
                          className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                          {skill}
                          <span className="text-muted-foreground tabular-nums">({count})</span>
                        </button>
                      ))}
                    </div>

                    <Separator className="my-5" />

                    <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Verification Coverage
                    </h3>
                    <div className="space-y-3">
                      {[
                        { pillar: "Identity", pct: 100 },
                        { pillar: "Work Authorization", pct: 100 },
                        { pillar: "Background Check", pct: 100 },
                        { pillar: "Credentials", pct: 67 },
                        { pillar: "References", pct: 83 },
                      ].map(({ pillar, pct }) => (
                        <div key={pillar} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-36">{pillar}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: pct === 100 ? "var(--color-vouch-verified)" : "var(--color-vouch-score)",
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium tabular-nums w-8 text-right">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ─── Detail Modal ─── */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            {selectedCandidate && (
              <>
                {/* Modal header with gradient */}
                <div className="relative px-6 pt-6 pb-5 bg-gradient-to-b from-primary/[0.04] to-transparent">
                  <DialogHeader>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={selectedCandidate.avatar_url}
                          alt={selectedCandidate.full_name}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-background shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <DialogTitle className="text-lg flex items-center gap-2">
                          {selectedCandidate.full_name}
                        </DialogTitle>
                        <DialogDescription className="text-sm mt-0.5">
                          {selectedCandidate.headline}
                        </DialogDescription>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {selectedCandidate.location}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {selectedCandidate.work_experience[0]?.company}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DialogHeader>
                </div>

                <div className="px-6 pb-6 space-y-5">
                  {/* 5-Pillar strip */}
                  <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Verification Status
                      </span>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                        {pillarCount(selectedCandidate.verification_pillars)}/5 Passed
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {PILLAR_CONFIG.map(({ key, label, icon: Icon }) => {
                        const passed = selectedCandidate.verification_pillars[key];
                        return (
                          <Tooltip key={key}>
                            <TooltipTrigger asChild>
                              <div
                                className={`flex flex-col items-center gap-1.5 rounded-lg py-2.5 px-1 text-center transition-colors cursor-default ${
                                  passed
                                    ? "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400"
                                    : "bg-muted/40 text-muted-foreground/40"
                                }`}
                              >
                                {passed
                                  ? <CheckCircle2 className="w-4 h-4" />
                                  : <XCircle className="w-4 h-4" />
                                }
                                <span className="text-[10px] font-medium leading-tight">{label}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{passed ? `${label} verified` : `${label} not yet verified`}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Verified {selectedCandidate.verified_at} &middot; Valid until {selectedCandidate.verification_expires_at}
                    </p>
                  </div>

                  {/* About */}
                  {selectedCandidate.summary && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">About</h3>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {selectedCandidate.summary}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Work Experience */}
                  {selectedCandidate.work_experience.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> Experience
                      </h3>
                      <div className="space-y-0 border-l-2 border-border ml-1 pl-4">
                        {selectedCandidate.work_experience.map((exp, i) => (
                          <div key={exp.id} className="relative pb-4 last:pb-0">
                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-border bg-background" />
                            <p className="text-sm font-medium text-foreground">{exp.title}</p>
                            <p className="text-xs text-muted-foreground">{exp.company}</p>
                            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                              {exp.start_date} &mdash; {exp.is_current ? "Present" : exp.end_date}
                            </p>
                            {exp.description && (
                              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {selectedCandidate.education.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" /> Education
                      </h3>
                      <div className="space-y-2">
                        {selectedCandidate.education.map((edu) => (
                          <div key={edu.id} className="flex items-start gap-3 rounded-lg border bg-card/50 px-4 py-3">
                            <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{edu.institution}</p>
                              <p className="text-xs text-muted-foreground">
                                {edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                              </p>
                              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                                {edu.start_date} &mdash; {edu.end_date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button className="flex-1 h-11">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Candidate
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={() => toggleSave(selectedCandidate.id)}
                    >
                      {savedIds.includes(selectedCandidate.id) ? (
                        <><BookmarkCheck className="w-4 h-4 mr-1.5" /> Saved</>
                      ) : (
                        <><Bookmark className="w-4 h-4 mr-1.5" /> Save</>
                      )}
                    </Button>
                    <Button variant="ghost" className="h-11 px-3" asChild>
                      <Link href={`/v/${selectedCandidate.public_slug}`}>
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Candidate Card
// ---------------------------------------------------------------------------

interface CandidateCardProps {
  candidate: Candidate;
  isSaved: boolean;
  onToggleSave: () => void;
  onViewProfile: () => void;
}

function CandidateCard({ candidate, isSaved, onToggleSave, onViewProfile }: CandidateCardProps) {
  const pillarsVerified = Object.values(candidate.verification_pillars).filter(Boolean).length;

  return (
    <Card
      className="group relative overflow-hidden border hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
      onClick={onViewProfile}
    >
      {/* Save button (top-right) */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
          isSaved
            ? "bg-primary/10 text-primary"
            : "bg-background/80 backdrop-blur-sm text-muted-foreground opacity-0 group-hover:opacity-100"
        }`}
        aria-label={isSaved ? "Remove from saved" : "Save candidate"}
      >
        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      </button>

      <CardContent className="p-5">
        {/* Avatar + info */}
        <div className="flex items-start gap-3.5">
          <div className="relative flex-shrink-0">
            <img
              src={candidate.avatar_url}
              alt={candidate.full_name}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-semibold text-sm text-foreground truncate leading-snug">
              {candidate.full_name}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {candidate.headline}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {candidate.location}
              </span>
              <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {candidate.work_experience[0]?.company}
              </span>
            </div>
          </div>
        </div>

        {/* Verification pills */}
        <div className="flex items-center gap-1 mt-4">
          <TooltipProvider>
            {PILLAR_CONFIG.map(({ key, label, icon: Icon }) => {
              const passed = candidate.verification_pillars[key];
              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        passed
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted/40 text-muted-foreground/25"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">{passed ? `${label} verified` : `${label} pending`}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 ml-1.5">
            {pillarsVerified}/5
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {candidate.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 4 && (
            <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] text-muted-foreground">
              +{candidate.skills.length - 4}
            </span>
          )}
        </div>

        {/* View profile row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
          <span className="text-xs text-muted-foreground">
            {candidate.work_experience.length} role{candidate.work_experience.length !== 1 ? "s" : ""} &middot; {candidate.education.length} degree{candidate.education.length !== 1 ? "s" : ""}
          </span>
          <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all">
            View Profile
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
