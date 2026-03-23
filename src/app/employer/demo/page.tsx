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
  ArrowLeft,
  Star,
  Clock,
  TrendingUp,
  BarChart3,
  FileCheck,
  Fingerprint,
  Scale,
  Award,
  MessageSquare,
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
import { VouchLogo } from "@/components/vouch/vouch-logo";

// ---------------------------------------------------------------------------
// Placeholder candidate data
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
    avatar_url:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=320&h=320&fit=crop&crop=face",
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
    avatar_url:
      "https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?w=320&h=320&fit=crop&crop=face",
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
    avatar_url:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=320&h=320&fit=crop&crop=face",
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
    avatar_url:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=320&h=320&fit=crop&crop=face",
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
    avatar_url:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=320&h=320&fit=crop&crop=face",
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
    avatar_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&h=320&fit=crop&crop=face",
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
    avatar_url:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=320&h=320&fit=crop&crop=face",
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
    avatar_url:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=320&h=320&fit=crop&crop=face",
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
    avatar_url:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=320&h=320&fit=crop&crop=face",
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
    avatar_url:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=320&h=320&fit=crop&crop=face",
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
    avatar_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&h=320&fit=crop&crop=face",
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
    avatar_url:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=320&h=320&fit=crop&crop=face",
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
// Helper: verification pillar icon & label
// ---------------------------------------------------------------------------

const PILLAR_CONFIG = [
  { key: "identity" as const, label: "Identity", icon: Fingerprint },
  { key: "work_auth" as const, label: "Work Auth", icon: Scale },
  { key: "background" as const, label: "Background", icon: FileCheck },
  { key: "credentials" as const, label: "Credentials", icon: Award },
  { key: "references" as const, label: "References", icon: MessageSquare },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EmployerDemoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
  }

  function pillarCount(pillars: Candidate["verification_pillars"]) {
    return Object.values(pillars).filter(Boolean).length;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">Demo Mode</span>
            <span className="text-muted-foreground">— This is a preview with sample candidates</span>
          </div>
          <Link href="/signup?role=employer">
            <Button size="sm" variant="default" className="rounded-full text-xs">
              Sign Up for Real Access
            </Button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <VouchLogo size="md" href="/" />
              <Separator orientation="vertical" className="h-8" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Candidate Marketplace
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse pre-verified candidates ready to hire
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-violet-500/20 text-violet-600 border-violet-500/30">
                Pro Plan
              </Badge>
              <span className="text-xs text-muted-foreground">
                Unlimited searches
              </span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Verified Candidates", value: "12", icon: ShieldCheck, color: "text-emerald-600" },
              { label: "Avg. Verification Score", value: "4.6 / 5", icon: Star, color: "text-amber-500" },
              { label: "Avg. Time to Hire", value: "3.2 days", icon: Clock, color: "text-blue-500" },
              { label: "New This Week", value: "4", icon: TrendingUp, color: "text-primary" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                <div className={`${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
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
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-1.5" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, headline, skills, or location..."
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
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
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
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
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

            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredCandidates.length} verified candidate{filteredCandidates.length !== 1 ? "s" : ""}
            </p>

            {filteredCandidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-medium">No candidates match your filters</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search or filter criteria</p>
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
                <p className="text-muted-foreground font-medium">No saved candidates yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Bookmark candidates from the search tab to see them here</p>
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

          {/* Analytics Tab (placeholder) */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Candidates by Location
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
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Top Skills in Pool
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { skill: "React", count: 4 },
                      { skill: "TypeScript", count: 3 },
                      { skill: "AWS", count: 4 },
                      { skill: "Python", count: 4 },
                      { skill: "Node.js", count: 2 },
                      { skill: "Docker", count: 3 },
                      { skill: "Kubernetes", count: 3 },
                      { skill: "PostgreSQL", count: 2 },
                      { skill: "Figma", count: 2 },
                      { skill: "Terraform", count: 2 },
                    ].map(({ skill, count }) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill} <span className="ml-1 text-muted-foreground">({count})</span>
                      </Badge>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Verification Coverage
                  </h3>
                  <div className="space-y-2">
                    {[
                      { pillar: "Identity Verified", pct: 100 },
                      { pillar: "Work Authorization", pct: 100 },
                      { pillar: "Background Check", pct: 100 },
                      { pillar: "Credentials", pct: 67 },
                      { pillar: "References", pct: 83 },
                    ].map(({ pillar, pct }) => (
                      <div key={pillar} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-40">{pillar}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-medium w-10 text-right">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
                  <img
                    src={selectedCandidate.avatar_url}
                    alt={selectedCandidate.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <DialogTitle className="flex items-center gap-2">
                      {selectedCandidate.full_name}
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedCandidate.headline}
                    </DialogDescription>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {selectedCandidate.location}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              {/* 5-Pillar Verification Status */}
              <div className="rounded-lg border bg-emerald-500/5 border-emerald-500/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {pillarCount(selectedCandidate.verification_pillars)}/5 Verification Pillars Passed
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {PILLAR_CONFIG.map(({ key, label, icon: Icon }) => {
                    const passed = selectedCandidate.verification_pillars[key];
                    return (
                      <div
                        key={key}
                        className={`flex flex-col items-center gap-1.5 rounded-lg p-2 text-center ${
                          passed
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted/50 text-muted-foreground/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-medium leading-tight">{label}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Verified on {selectedCandidate.verified_at} · Expires {selectedCandidate.verification_expires_at}
                </p>
              </div>

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
              <div>
                <h3 className="text-sm font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              {selectedCandidate.work_experience.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Experience
                  </h3>
                  <div className="space-y-3">
                    {selectedCandidate.work_experience.map((exp) => (
                      <div key={exp.id} className="rounded-lg border px-4 py-3">
                        <p className="font-medium text-sm">{exp.title}</p>
                        <p className="text-xs text-muted-foreground">{exp.company}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {exp.start_date} &mdash; {exp.is_current ? "Present" : exp.end_date}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-muted-foreground mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedCandidate.education.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Education
                  </h3>
                  <div className="space-y-3">
                    {selectedCandidate.education.map((edu) => (
                      <div key={edu.id} className="rounded-lg border px-4 py-3">
                        <p className="font-medium text-sm">{edu.institution}</p>
                        <p className="text-xs text-muted-foreground">
                          {edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {edu.start_date} &mdash; {edu.end_date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1">
                  Contact Candidate
                </Button>
                <Button variant="outline" onClick={() => toggleSave(selectedCandidate.id)}>
                  {savedIds.includes(selectedCandidate.id) ? (
                    <><BookmarkCheck className="w-4 h-4 mr-1.5" /> Saved</>
                  ) : (
                    <><Bookmark className="w-4 h-4 mr-1.5" /> Save</>
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
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <img
            src={candidate.avatar_url}
            alt={candidate.full_name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm truncate">{candidate.full_name}</h3>
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{candidate.headline}</p>
            <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {candidate.location}
            </p>
          </div>
        </div>

        {/* Verification pillars mini */}
        <div className="flex items-center gap-1.5 mt-3">
          {PILLAR_CONFIG.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className={`w-6 h-6 rounded-md flex items-center justify-center ${
                candidate.verification_pillars[key]
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted/50 text-muted-foreground/30"
              }`}
            >
              <Icon className="w-3 h-3" />
            </div>
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">{pillarsVerified}/5</span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mt-3">
          {candidate.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>
          ))}
          {candidate.skills.length > 4 && (
            <Badge variant="outline" className="text-[10px]">+{candidate.skills.length - 4}</Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1" onClick={onViewProfile}>
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View Profile
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
            className={isSaved ? "text-primary" : "text-muted-foreground"}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
