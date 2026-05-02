-- Defensive: the profiles.is_admin column is read by /api/jobs/import and the
-- middleware admin gate, but no migration in source control adds it. If it
-- only exists in the production database via dashboard edits, a `db reset`
-- would drop the admin gate silently. Add it idempotently here so source is
-- the source of truth.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
