-- Vouch Phase 1+2: Database migrations
-- All changes are additive — no renames or drops.

-- Extend profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_original_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_enhanced_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS summary_ai text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vouch_score integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interview_ready_score integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status_json jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vanity_slug text UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parsed_cv_json jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- Backfill existing users so they don't get trapped in onboarding
UPDATE profiles SET onboarding_completed_at = now()
WHERE full_name IS NOT NULL AND onboarding_completed_at IS NULL;

-- Copy existing public_slug to vanity_slug
UPDATE profiles SET vanity_slug = public_slug WHERE public_slug IS NOT NULL AND vanity_slug IS NULL;

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text,
  source text DEFAULT 'manual',
  verified boolean DEFAULT false,
  years_experience integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, name)
);
CREATE INDEX IF NOT EXISTS idx_skills_profile ON skills(profile_id);

-- Portfolio items
CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  url text,
  image_url text,
  item_type text DEFAULT 'project',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Profile views (candidate analytics)
CREATE TABLE IF NOT EXISTS profile_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  viewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  viewer_type text DEFAULT 'employer',
  source text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views(profile_id, created_at DESC);

-- Assessments (future skill verification)
CREATE TABLE IF NOT EXISTS assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  score integer,
  max_score integer DEFAULT 100,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY skills_owner ON skills FOR ALL USING (profile_id = auth.uid());
CREATE POLICY skills_read ON skills FOR SELECT USING (true);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY portfolio_owner ON portfolio_items FOR ALL USING (profile_id = auth.uid());
CREATE POLICY portfolio_read ON portfolio_items FOR SELECT USING (true);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY views_read_own ON profile_views FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY views_insert ON profile_views FOR INSERT WITH CHECK (viewer_id = auth.uid());
