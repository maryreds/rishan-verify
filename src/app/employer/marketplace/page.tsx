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

const PLACEHOLDER_AVATARS = [
  "https://randomuser.me/api/portraits/women/44.jpg",   // Priya
  "https://randomuser.me/api/portraits/men/32.jpg",      // Marcus
  "https://randomuser.me/api/portraits/women/65.jpg",    // Sofia
  "https://randomuser.me/api/portraits/men/75.jpg",      // Arjun
  "https://randomuser.me/api/portraits/women/90.jpg",    // Aisha
  "https://randomuser.me/api/portraits/women/26.jpg",    // Jenny
  "https://randomuser.me/api/portraits/men/46.jpg",      // Ryan
  "https://randomuser.me/api/portraits/women/55.jpg",    // Natalia
  "https://randomuser.me/api/portraits/men/22.jpg",      // Kevin
  "https://randomuser.me/api/portraits/women/72.jpg",    // Imani
  "https://randomuser.me/api/portraits/women/33.jpg",    // Rachel
  "https://randomuser.me/api/portraits/men/64.jpg",      // Vikram
];

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
    avatar_url: PLACEHOLDER_AVATARS[0],
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
    avatar_url: PLACEHOLDER_AVATARS[1],
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
    avatar_url: PLACEHOLDER_AVATARS[2],
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
    avatar_url: PLACEHOLDER_AVATARS[3],
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
    avatar_url: PLACEHOLDER_AVATARS[4],
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
    avatar_url: PLACEHOLDER_AVATARS[5],
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
    avatar_url: PLACEHOLDER_AVATARS[6],
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
    avatar_url: PLACEHOLDER_AVATARS[7],
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
    avatar_url: PLACEHOLDER_AVATARS[8],
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
    avatar_url: PLACEHOLDER_AVATARS[9],
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
    avatar_url: PLACEHOLDER_AVATARS[10],
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
    avatar_url: PLACEHOLDER_AVATARS[11],
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
  const [visibleCount, setVisibleCount] = useState(6);

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

  const visibleCandidates = filteredCandidates.slice(0, visibleCount);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#faf9f5]">
        {/* ─── Top Nav (fixed) ─── */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf9f5]/80 backdrop-blur-md border-b border-border/40">
          <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <VouchLogo size="lg" href="/" />
              <div className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
                <Link href="/candidate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  For Candidates
                </Link>
                <Link href="/employer/marketplace" className="text-sm font-medium text-foreground">
                  For Employers
                </Link>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Login
                </Button>
              </Link>
              <Link href="/signup?role=employer">
                <Button size="sm" className="rounded-full bg-primary text-primary-foreground">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Spacer for fixed nav */}
        <div className="h-16" />

        {/* ─── Hero Search Section ─── */}
        <div className="bg-gradient-to-b from-[#faf9f5] to-white border-b border-border/30">
          <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20 text-center">
            <h1 className="font-[var(--font-headline)] text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Find verified talent, faster.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Browse pre-screened professionals who have passed our rigorous 5-pillar verification. No guesswork, just qualified candidates ready to hire.
            </p>

            {/* Search Bar Container */}
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row items-stretch gap-3 bg-white rounded-3xl shadow-lg shadow-black/5 border border-border/40 p-3">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">
                    search
                  </span>
                  <Input
                    placeholder="Search by name, role, skills, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 bg-transparent border-0 shadow-none focus-visible:ring-0 text-base"
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="h-10 rounded-2xl bg-muted/60 border-0 text-sm px-4 w-auto min-w-[120px]">
                      <span className="material-symbols-outlined text-[16px] mr-1.5 text-muted-foreground">location_on</span>
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
                    <SelectTrigger className="h-10 rounded-2xl bg-muted/60 border-0 text-sm px-4 w-auto min-w-[130px]">
                      <span className="material-symbols-outlined text-[16px] mr-1.5 text-muted-foreground">star</span>
                      <SelectValue placeholder="Vouch Score" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      {uniqueSkills.map((skill) => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    className="h-10 px-4 rounded-2xl bg-muted/60 text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                    onClick={() => { setSearchQuery(""); setLocationFilter("all"); setSkillFilter("all"); }}
                  >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    More Filters
                  </button>
                  <button
                    className="h-10 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-green-600 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    Search Talent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Content ─── */}
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

            {/* ─── Sidebar ─── */}
            <div className="md:col-span-3">
              {/* Saved Filters */}
              <div className="bg-white rounded-2xl border border-border/40 p-5 mb-6">
                <h3 className="font-[var(--font-headline)] text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">bookmark</span>
                  Saved Filters
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Senior Devs", icon: "code", count: 4 },
                    { label: "Product Designers", icon: "palette", count: 2 },
                    { label: "ML Engineers", icon: "psychology", count: 2 },
                    { label: "DevOps / Cloud", icon: "cloud", count: 3 },
                    { label: "Engineering Managers", icon: "groups", count: 1 },
                  ].map(({ label, icon, count }) => (
                    <button
                      key={label}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted/60 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-[18px] text-muted-foreground">{icon}</span>
                      <span className="flex-1">{label}</span>
                      <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vouch Verification Badges */}
              <div className="bg-white rounded-2xl border border-border/40 p-5">
                <h3 className="font-[var(--font-headline)] text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-500">verified_user</span>
                  Vouch Verification
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Identity Verified", icon: "fingerprint", desc: "Government ID confirmed", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Work Authorization", icon: "gavel", desc: "Legal work status confirmed", color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Criminal Background", icon: "shield", desc: "Background check cleared", color: "text-purple-600", bg: "bg-purple-50" },
                  ].map(({ label, icon, desc, color, bg }) => (
                    <div key={label} className={`flex items-start gap-3 rounded-xl ${bg} p-3`}>
                      <span className={`material-symbols-outlined text-[20px] ${color} mt-0.5`}>{icon}</span>
                      <div>
                        <p className={`text-sm font-medium ${color}`}>{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Results Grid ─── */}
            <div className="md:col-span-9">
              {/* Results header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{filteredCandidates.length}</span> verified professional{filteredCandidates.length !== 1 ? "s" : ""}
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
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[170px] h-9 rounded-xl bg-white border-border/40 text-sm">
                    <span className="material-symbols-outlined text-[16px] mr-1.5 text-muted-foreground">sort</span>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Verified</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Candidate Grid */}
              {filteredCandidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[28px] text-muted-foreground/50">group</span>
                  </div>
                  <p className="text-foreground font-medium mb-1">No matches found</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Try broadening your search or adjusting filters to find more candidates.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {visibleCandidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        isSaved={savedIds.includes(candidate.id)}
                        onToggleSave={() => toggleSave(candidate.id)}
                        onViewProfile={() => openDetail(candidate)}
                      />
                    ))}
                  </div>

                  {/* Load More */}
                  {visibleCount < filteredCandidates.length && (
                    <div className="flex justify-center mt-10">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 6)}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl border border-border/60 bg-white text-sm font-medium text-foreground hover:bg-muted/40 hover:border-primary/30 transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary">expand_more</span>
                        Load more talent
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border/40 bg-white mt-16">
          <div className="max-w-[1400px] mx-auto px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {/* Column 1 - Brand */}
              <div>
                <VouchLogo size="lg" href="/" />
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  The trusted marketplace for verified professional talent. Hire with confidence.
                </p>
              </div>

              {/* Column 2 - Product */}
              <div>
                <h4 className="font-[var(--font-headline)] text-sm font-bold text-foreground mb-4">Product</h4>
                <ul className="space-y-3">
                  {["Talent Marketplace", "Verification", "Pricing", "API"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3 - Company */}
              <div>
                <h4 className="font-[var(--font-headline)] text-sm font-bold text-foreground mb-4">Company</h4>
                <ul className="space-y-3">
                  {["About", "Blog", "Careers", "Contact"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4 - Legal */}
              <div>
                <h4 className="font-[var(--font-headline)] text-sm font-bold text-foreground mb-4">Legal</h4>
                <ul className="space-y-3">
                  {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator className="my-10" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Vouch. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                  <Link key={social} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {social}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>

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
    <div
      className="group relative bg-white rounded-2xl border border-border/40 p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary/30"
      onClick={onViewProfile}
    >
      {/* Save button (top-right) */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
        className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
          isSaved
            ? "bg-primary/10 text-primary"
            : "bg-muted/60 text-muted-foreground opacity-0 group-hover:opacity-100"
        }`}
        aria-label={isSaved ? "Remove from saved" : "Save candidate"}
      >
        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      </button>

      {/* Top row: Avatar + Name + Vouch Score */}
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={candidate.avatar_url}
            alt={candidate.full_name}
            className="w-16 h-16 rounded-2xl object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-[var(--font-headline)] font-bold text-base text-foreground truncate leading-snug">
            {candidate.full_name}
          </h3>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {candidate.headline}
          </p>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {candidate.location}
          </div>
        </div>
        {/* Vouch Score */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground leading-none">{pillarsVerified}/5</span>
          <span className="text-[8px] text-primary-foreground/70 mt-0.5">VOUCH</span>
        </div>
      </div>

      {/* Verification badges */}
      <div className="flex items-center gap-1.5 mt-4">
        <TooltipProvider>
          {PILLAR_CONFIG.slice(0, 3).map(({ key, label, icon: Icon }) => {
            const passed = candidate.verification_pillars[key];
            if (!passed) return null;
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                    <span className="text-[11px] font-medium text-emerald-700">{label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{label} verified</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          {PILLAR_CONFIG.slice(3).some(({ key }) => candidate.verification_pillars[key]) && (
            <div className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1">
              <span className="text-[11px] font-medium text-emerald-700">
                +{PILLAR_CONFIG.slice(3).filter(({ key }) => candidate.verification_pillars[key]).length} more
              </span>
            </div>
          )}
        </TooltipProvider>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {candidate.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="inline-flex items-center rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
            {skill}
          </span>
        ))}
        {candidate.skills.length > 4 && (
          <span className="inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] text-muted-foreground">
            +{candidate.skills.length - 4}
          </span>
        )}
      </div>

      {/* Bottom row: View Full Profile + Chat icon */}
      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/40">
        <Link
          href={`/employer/candidate/${candidate.id}`}
          className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-green-600 transition-all shadow-sm shadow-emerald-500/20 flex items-center justify-center gap-2"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          View Full Profile
        </Link>
        <button
          className="flex-shrink-0 w-10 h-10 rounded-xl border border-border/60 bg-white hover:bg-muted/40 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
          onClick={(e) => { e.stopPropagation(); }}
          aria-label="Message candidate"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
        </button>
      </div>
    </div>
  );
}
