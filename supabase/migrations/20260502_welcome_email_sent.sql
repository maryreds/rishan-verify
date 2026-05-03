-- Track whether the post-signup welcome email has been sent for a profile.
-- Used by /api/auth/welcome to make the send idempotent so a re-trigger
-- (page refresh, retry, etc.) never spams the candidate.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz;
