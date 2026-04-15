-- ========================================
-- Address History: AI-parsed document addresses
-- ========================================

CREATE TABLE IF NOT EXISTS address_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  street text,
  city text,
  state text,
  zip text,
  document_date date,
  document_type text,
  verified_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE address_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own address history" ON address_history FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert own address history" ON address_history FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can delete own address history" ON address_history FOR DELETE USING (auth.uid() = profile_id);
