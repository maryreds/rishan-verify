import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Only allow `next` to redirect to a same-origin path. Reject protocol-relative
// (`//evil.com`), absolute URLs, and anything that doesn't start with `/`.
function safeNext(input: string | null): string {
  if (!input) return "/dashboard";
  if (!input.startsWith("/")) return "/dashboard";
  if (input.startsWith("//")) return "/dashboard";
  return input;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
