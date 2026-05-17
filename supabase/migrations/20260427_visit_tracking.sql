-- ========================================
-- Visit tracking: site analytics for admin
-- ========================================

CREATE TABLE IF NOT EXISTS visit_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token text UNIQUE NOT NULL,
  visitor_id text,
  ip text,
  user_agent text,
  country text,
  city text,
  referrer text,
  started_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visit_sessions_visitor ON visit_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visit_sessions_last_seen ON visit_sessions(last_seen_at DESC);

CREATE TABLE IF NOT EXISTS page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES visit_sessions(id) ON DELETE CASCADE,
  path text NOT NULL,
  entered_at timestamptz DEFAULT now(),
  last_heartbeat_at timestamptz DEFAULT now(),
  duration_seconds int DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_entered ON page_views(entered_at DESC);

ALTER TABLE visit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Anon clients write via SECURITY DEFINER functions below; no direct table access for anon
-- Service role (used by /admin/visitors) bypasses RLS.

CREATE OR REPLACE FUNCTION upsert_visit_session(
  p_session_token text,
  p_visitor_id text,
  p_ip text,
  p_user_agent text,
  p_country text,
  p_city text,
  p_referrer text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO visit_sessions (session_token, visitor_id, ip, user_agent, country, city, referrer, last_seen_at)
  VALUES (p_session_token, p_visitor_id, p_ip, p_user_agent, p_country, p_city, p_referrer, now())
  ON CONFLICT (session_token) DO UPDATE
  SET
    last_seen_at = now(),
    visitor_id = COALESCE(visit_sessions.visitor_id, EXCLUDED.visitor_id),
    ip = COALESCE(visit_sessions.ip, EXCLUDED.ip),
    user_agent = COALESCE(visit_sessions.user_agent, EXCLUDED.user_agent),
    country = COALESCE(visit_sessions.country, EXCLUDED.country),
    city = COALESCE(visit_sessions.city, EXCLUDED.city),
    referrer = COALESCE(visit_sessions.referrer, EXCLUDED.referrer)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION record_page_view(
  p_session_id uuid,
  p_path text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO page_views (session_id, path)
  VALUES (p_session_id, p_path)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION heartbeat_page_view(
  p_view_id uuid,
  p_session_token text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE page_views
  SET
    last_heartbeat_at = now(),
    duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - entered_at))::int)
  WHERE id = p_view_id;

  UPDATE visit_sessions
  SET last_seen_at = now()
  WHERE session_token = p_session_token;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_visit_session(text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_page_view(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION heartbeat_page_view(uuid, text) TO anon, authenticated;
