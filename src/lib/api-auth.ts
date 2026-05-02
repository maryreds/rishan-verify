import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export type AuthSuccess = {
  ok: true;
  userId: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

export type AuthFailure = {
  ok: false;
  response: NextResponse;
};

/**
 * Require an authenticated Supabase user for API routes.
 *
 * Usage:
 *   const auth = await requireAuth();
 *   if (!auth.ok) return auth.response;
 *   // auth.userId, auth.supabase available
 */
export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { ok: true, userId: user.id, supabase };
}
