import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client that uses the service-role key and bypasses RLS.
 *
 * Use ONLY in trusted server contexts where the caller has been authenticated
 * by some other means (signature-verified webhook, internal cron, etc).
 * NEVER expose this client to the browser, NEVER use it in a route that
 * accepts arbitrary user input without validating ownership first.
 *
 * The service role key must be present as SUPABASE_SERVICE_ROLE_KEY (server-only,
 * never NEXT_PUBLIC_).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
