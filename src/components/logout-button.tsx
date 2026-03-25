"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export function LogoutButton({ className, children }: { className?: string; children?: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className={className}>
      {children ?? (
        <>
          <span className="material-symbols-outlined text-xl">logout</span>
          Log Out
        </>
      )}
    </button>
  );
}
