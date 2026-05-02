-- Tighten public read RLS so only profiles that have published a public badge
-- (vanity_slug IS NOT NULL) leak their child rows to the anon role.
--
-- Before this migration, eight tables allowed `SELECT USING (true)` which let
-- anyone with the anon key dump every row of every user's data. The public
-- badge page at /v/[slug] only ever queries by profile_id where vanity_slug is
-- set, so narrowing the policy preserves all current functionality while
-- closing the bulk-enumeration leak.

-- ── skills ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS skills_read ON skills;
CREATE POLICY skills_public_read ON skills
  FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = skills.profile_id
        AND p.vanity_slug IS NOT NULL
    )
  );

-- ── portfolio_items ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS portfolio_read ON portfolio_items;
CREATE POLICY portfolio_public_read ON portfolio_items
  FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = portfolio_items.profile_id
        AND p.vanity_slug IS NOT NULL
    )
  );

-- ── credentials ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS credentials_read ON credentials;
CREATE POLICY credentials_public_read ON credentials
  FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = credentials.profile_id
        AND p.vanity_slug IS NOT NULL
    )
  );

-- ── headline_variants ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS headline_variants_read ON headline_variants;
CREATE POLICY headline_variants_public_read ON headline_variants
  FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = headline_variants.profile_id
        AND p.vanity_slug IS NOT NULL
    )
  );

-- ── assessments ─────────────────────────────────────────────────────────────
-- Live audit (2026-05-02) confirmed assessments was anon-readable in production
-- even though no explicit `*_read` policy is in source — Supabase had a stale
-- permissive policy. Recreate the table policies from scratch.
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS assessments_read ON assessments;
DROP POLICY IF EXISTS assessments_public_read ON assessments;
DROP POLICY IF EXISTS assessments_owner ON assessments;
CREATE POLICY assessments_owner ON assessments
  FOR ALL
  USING (profile_id = auth.uid());
CREATE POLICY assessments_public_read ON assessments
  FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = assessments.profile_id
        AND p.vanity_slug IS NOT NULL
    )
  );

-- ── peer_vouches ────────────────────────────────────────────────────────────
-- Original `vouches_owner` (FOR ALL USING …) had no WITH CHECK, which let a
-- vouchee INSERT a row with a forged voucher_id (anyone) so long as
-- vouchee_id = self. Combined with `vouches_public_read USING (status = 'accepted')`,
-- attackers could fabricate vouches that show on public profiles.
--
-- Replace with explicit per-action policies:
--  • SELECT — voucher, vouchee, or anon reading an accepted vouch on a public profile
--  • INSERT — only the voucher (auth.uid() = voucher_id) and only as 'pending'
--  • UPDATE — only the vouchee can flip status from 'pending' → 'accepted'/'declined'
--             (no editing of voucher_id, voucher_score, skill, message)
--  • DELETE — only the voucher
DROP POLICY IF EXISTS vouches_owner ON peer_vouches;
DROP POLICY IF EXISTS vouches_public_read ON peer_vouches;

CREATE POLICY vouches_select ON peer_vouches
  FOR SELECT
  USING (
    voucher_id = auth.uid()
    OR vouchee_id = auth.uid()
    OR (
      status = 'accepted'
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = peer_vouches.vouchee_id
          AND p.vanity_slug IS NOT NULL
      )
    )
  );

CREATE POLICY vouches_insert ON peer_vouches
  FOR INSERT
  WITH CHECK (
    voucher_id = auth.uid()
    AND status = 'pending'
  );

CREATE POLICY vouches_update ON peer_vouches
  FOR UPDATE
  USING (vouchee_id = auth.uid())
  WITH CHECK (vouchee_id = auth.uid() AND status IN ('accepted', 'declined'));

CREATE POLICY vouches_delete ON peer_vouches
  FOR DELETE
  USING (voucher_id = auth.uid());

-- ── references (token_submit hardening) ─────────────────────────────────────
-- Original `references_token_submit FOR UPDATE USING (true)` lets ANY
-- authenticated user PATCH any reference row directly via PostgREST,
-- bypassing the token check that lives only in the API route. The /api/
-- references/submit route was refactored in commit f… to use the
-- service-role admin client (validates the token in app code, then writes
-- with elevated privs). With that in place, the broad UPDATE policy can be
-- dropped — direct PostgREST updates from anon/auth users are blocked.
DROP POLICY IF EXISTS references_token_submit ON "references";

-- ── communities (intentionally remains world-readable) ──────────────────────
-- communities, community_members, community_messages are intentionally public
-- as they are forum-style content. Leaving as-is. If you decide to gate
-- communities behind authenticated members, drop those policies separately.

-- ── verify ──────────────────────────────────────────────────────────────────
-- After applying, re-run /tmp/supabase-audit/probe.txt against production.
-- Anonymous SELECT * on `skills`, `assessments`, `portfolio_items`,
-- `credentials`, `headline_variants` should return ONLY rows whose profile has
-- vanity_slug set, i.e., public-badge candidates only.
