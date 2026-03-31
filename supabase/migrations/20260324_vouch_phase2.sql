-- ========================================
-- Vouch Phase 2: World-Class Candidate Platform
-- ========================================

-- Extended profile views tracking
ALTER TABLE profile_views ADD COLUMN IF NOT EXISTS search_query text;
ALTER TABLE profile_views ADD COLUMN IF NOT EXISTS skills_matched text[];
ALTER TABLE profile_views ADD COLUMN IF NOT EXISTS viewer_industry text;
ALTER TABLE profile_views ADD COLUMN IF NOT EXISTS viewer_company text;
ALTER TABLE profile_views ADD COLUMN IF NOT EXISTS action text DEFAULT 'view';
ALTER TABLE profile_views ADD COLUMN IF NOT EXISTS referrer text;
CREATE INDEX IF NOT EXISTS idx_profile_views_action ON profile_views(profile_id, action, created_at DESC);

-- Video intro fields on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_intro_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_intro_transcript text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_intro_duration integer;

-- Headline variants for A/B testing
CREATE TABLE IF NOT EXISTS headline_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  headline text NOT NULL,
  is_active boolean DEFAULT false,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE headline_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY headline_variants_owner ON headline_variants FOR ALL USING (profile_id = auth.uid());
CREATE POLICY headline_variants_read ON headline_variants FOR SELECT USING (true);

-- Extended assessments for micro-quizzes
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS questions jsonb;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS answers jsonb;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS duration_seconds integer;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS status text DEFAULT 'not_started';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS started_at timestamptz;

-- References
CREATE TABLE IF NOT EXISTS "references" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referee_name text NOT NULL,
  referee_email text NOT NULL,
  referee_title text,
  referee_company text,
  relationship text,
  status text DEFAULT 'pending',
  token text UNIQUE NOT NULL,
  responses jsonb,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, referee_email)
);
ALTER TABLE "references" ENABLE ROW LEVEL SECURITY;
CREATE POLICY references_owner ON "references" FOR ALL USING (profile_id = auth.uid());
CREATE POLICY references_public_read ON "references" FOR SELECT USING (status = 'completed');
CREATE POLICY references_token_submit ON "references" FOR UPDATE USING (true);

-- Reference questions (static config)
CREATE TABLE IF NOT EXISTS reference_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text text NOT NULL,
  question_type text DEFAULT 'rating',
  options jsonb,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true
);

-- Seed default reference questions
INSERT INTO reference_questions (question_text, question_type, sort_order) VALUES
  ('How would you rate this person''s technical skills?', 'rating', 1),
  ('How would you rate their communication skills?', 'rating', 2),
  ('How would you rate their reliability and work ethic?', 'rating', 3),
  ('How would you rate their ability to work in a team?', 'rating', 4),
  ('What is this person''s greatest professional strength?', 'text', 5),
  ('Is there anything else you''d like to share about this person?', 'text', 6)
ON CONFLICT DO NOTHING;

-- Credentials vault
CREATE TABLE IF NOT EXISTS credentials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  issuer text,
  credential_type text DEFAULT 'certification',
  issue_date date,
  expiry_date date,
  credential_url text,
  document_path text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY credentials_owner ON credentials FOR ALL USING (profile_id = auth.uid());
CREATE POLICY credentials_read ON credentials FOR SELECT USING (true);

-- Jobs table (for smart matching)
CREATE TABLE IF NOT EXISTS jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  company text,
  location text,
  description text,
  required_skills text[],
  salary_min integer,
  salary_max integer,
  job_type text,
  source text,
  source_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING gin(required_skills);

-- Job matches
CREATE TABLE IF NOT EXISTS job_matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  match_score integer,
  matching_skills text[],
  missing_skills text[],
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, job_id)
);
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY job_matches_owner ON job_matches FOR SELECT USING (profile_id = auth.uid());

-- Interview sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_role text,
  target_company text,
  messages jsonb DEFAULT '[]',
  feedback jsonb,
  score integer,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY interview_sessions_owner ON interview_sessions FOR ALL USING (profile_id = auth.uid());

-- Peer vouches
CREATE TABLE IF NOT EXISTS peer_vouches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vouchee_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill text,
  message text NOT NULL,
  voucher_score integer,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(voucher_id, vouchee_id, skill)
);
ALTER TABLE peer_vouches ENABLE ROW LEVEL SECURITY;
CREATE POLICY vouches_owner ON peer_vouches FOR ALL USING (voucher_id = auth.uid() OR vouchee_id = auth.uid());
CREATE POLICY vouches_public_read ON peer_vouches FOR SELECT USING (status = 'accepted');

-- Communities
CREATE TABLE IF NOT EXISTS communities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  community_type text DEFAULT 'skill',
  slug text UNIQUE NOT NULL,
  member_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY communities_read ON communities FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS community_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(community_id, profile_id)
);
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY community_members_read ON community_members FOR SELECT USING (true);
CREATE POLICY community_members_manage ON community_members FOR ALL USING (profile_id = auth.uid());

CREATE TABLE IF NOT EXISTS community_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES community_messages(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY community_messages_read ON community_messages FOR SELECT USING (true);
CREATE POLICY community_messages_write ON community_messages FOR INSERT WITH CHECK (author_id = auth.uid());

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referee_email text NOT NULL,
  referee_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  reward_amount integer,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY referrals_owner ON referrals FOR ALL USING (referrer_id = auth.uid());

-- Seed some default communities
INSERT INTO communities (name, description, community_type, slug) VALUES
  ('React Developers', 'Connect with verified React engineers', 'skill', 'react-developers'),
  ('Python Engineers', 'Python professionals community', 'skill', 'python-engineers'),
  ('Data Scientists', 'Data science and ML practitioners', 'skill', 'data-scientists'),
  ('Product Managers', 'PM community for verified professionals', 'skill', 'product-managers'),
  ('Austin Tech', 'Tech professionals in Austin, TX', 'location', 'austin-tech'),
  ('NYC Tech', 'Tech professionals in New York City', 'location', 'nyc-tech'),
  ('SF Bay Area', 'Silicon Valley and SF Bay tech community', 'location', 'sf-bay-area'),
  ('Fintech', 'Financial technology professionals', 'industry', 'fintech'),
  ('Healthcare Tech', 'Healthcare and healthtech community', 'industry', 'healthcare-tech')
ON CONFLICT DO NOTHING;
