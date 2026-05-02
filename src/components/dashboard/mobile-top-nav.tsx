"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/my-profile", label: "Preview", icon: "visibility" },
  { href: "/dashboard/profile", label: "Profile", icon: "person" },
  { href: "/dashboard/resume", label: "Resume", icon: "description" },
  { href: "/dashboard/verify", label: "Verify", icon: "verified" },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: "grid_view" },
  { href: "/dashboard/jobs", label: "Jobs", icon: "work" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "analytics" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

interface DashboardMobileTopNavProps {
  userName: string;
  photoUrl: string | null;
}

export function DashboardMobileTopNav({
  userName,
  photoUrl,
}: DashboardMobileTopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-[#f5f4f0]/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="font-[var(--font-headline)] font-black text-lg tracking-tight"
        >
          Vouch
        </Link>
        <div className="flex items-center gap-3">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-base">person</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-muted"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className="material-symbols-outlined text-2xl">
              {open ? "close" : "menu"}
            </span>
          </button>
        </div>
      </header>

      {open && (
        <div
          className="md:hidden fixed top-14 inset-x-0 bottom-0 z-40 bg-[#faf9f5] overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <nav className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base",
                    active
                      ? "bg-white text-[#3E6957] shadow-sm font-semibold"
                      : "text-[#414944] hover:bg-zinc-200/50"
                  )}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base text-[#414944] hover:bg-zinc-200/50 mt-4 border-t border-border pt-4"
            >
              <span className="material-symbols-outlined">logout</span>
              Sign out
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
