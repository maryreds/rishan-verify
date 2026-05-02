-- Public waitlist for the /check (Resume Authenticity Score) landing page.
-- Anyone can submit (the route uses the service-role client server-side so
-- RLS is bypassed for inserts). Service-role-only reads keep the list
-- private; anon can never list emails.

CREATE TABLE IF NOT EXISTS check_waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  source text DEFAULT 'check_landing',
  notified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_check_waitlist_email ON check_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_check_waitlist_created ON check_waitlist(created_at DESC);

ALTER TABLE check_waitlist ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: anon can do nothing, only the service-role
-- client (used by /api/check/waitlist) can read or write.
