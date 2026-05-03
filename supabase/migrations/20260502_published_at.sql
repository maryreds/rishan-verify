-- Track when a candidate first publishes their profile via the Quick Verify
-- path in onboarding. NULL means the candidate has not yet published; the
-- public /v/[slug] page MUST tolerate this gracefully (slug-based lookup is
-- still allowed; this column is informational + lets us short-circuit the
-- post-publish share screen for repeat visits).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS published_at timestamptz;
