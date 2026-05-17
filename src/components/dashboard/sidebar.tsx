"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/my-profile", label: "Preview Profile", icon: "visibility" },
  { href: "/dashboard/profile", label: "Profile", icon: "person" },
  { href: "/dashboard/resume", label: "Resume", icon: "description" },
  { href: "/dashboard/verify", label: "Verify", icon: "verified" },
  { href: "/dashboard/vouches", label: "Vouches", icon: "recommend" },
  { href: "/dashboard/assessments", label: "Assessments", icon: "assignment" },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: "grid_view" },
  { href: "/dashboard/coach", label: "AI Coach", icon: "psychology" },
  { href: "/dashboard/jobs", label: "Job Matches", icon: "work" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "analytics" },
];

const bottomItems = [
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
  { href: "/logout", label: "Logout", icon: "logout" },
];

interface DashboardSidebarProps {
  userName: string;
  vouchScore: number;
  photoUrl: string | null;
}

export function DashboardSidebar({ userName, vouchScore, photoUrl }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-[#f5f4f0] p-6 flex flex-col z-30">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold font-[var(--font-headline)] tracking-tight text-foreground">
          Vouch
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="mb-8 flex items-center space-x-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-primary-container text-xl">person</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
          <p className="text-xs text-muted-foreground">Vouch Score: {vouchScore}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-[#3E6957] shadow-sm scale-[0.98]"
                  : "text-[#414944] hover:bg-zinc-200/50 hover:translate-x-1 transition-transform"
              )}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border pt-4 mt-4 space-y-1">
        <button className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs mb-3 hover:opacity-90 transition-opacity">
          Upgrade to Pro
        </button>

        {bottomItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-[#3E6957] shadow-sm scale-[0.98]"
                  : "text-[#414944] hover:bg-zinc-200/50 hover:translate-x-1 transition-transform"
              )}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
