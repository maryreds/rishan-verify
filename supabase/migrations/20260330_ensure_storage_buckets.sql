-- ========================================
-- Ensure all storage buckets exist with proper RLS policies
-- Idempotent: safe to run multiple times
-- ========================================

-- 1. Ensure buckets exist
-- photos: public (profile pictures visible to everyone)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- resumes: private (only the owner should access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- verification-docs: private (owner uploads, admins can read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS policies (using DO blocks for IF NOT EXISTS semantics)

-- ----------------------------------------
-- PHOTOS bucket policies
-- ----------------------------------------

-- Public read access for photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Anyone can read photos'
  ) THEN
    CREATE POLICY "Anyone can read photos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'photos');
  END IF;
END $$;

-- Authenticated users can upload photos to their own folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users can upload their own photos'
  ) THEN
    CREATE POLICY "Users can upload their own photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Authenticated users can update their own photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users can update their own photos'
  ) THEN
    CREATE POLICY "Users can update their own photos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Authenticated users can delete their own photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Users can delete their own photos'
  ) THEN
    CREATE POLICY "Users can delete their own photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- ----------------------------------------
-- RESUMES bucket policies
-- ----------------------------------------

-- Owner can read their own resumes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Owner can read own resumes'
  ) THEN
    CREATE POLICY "Owner can read own resumes"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'resumes'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Owner can upload resumes to their own folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Owner can upload own resumes'
  ) THEN
    CREATE POLICY "Owner can upload own resumes"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'resumes'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Owner can update their own resumes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Owner can update own resumes'
  ) THEN
    CREATE POLICY "Owner can update own resumes"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'resumes'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Owner can delete their own resumes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Owner can delete own resumes'
  ) THEN
    CREATE POLICY "Owner can delete own resumes"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'resumes'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- ----------------------------------------
-- VERIFICATION-DOCS bucket policies
-- ----------------------------------------

-- Owner can upload verification docs to their own folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Owner can upload verification docs'
  ) THEN
    CREATE POLICY "Owner can upload verification docs"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'verification-docs'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Owner can read their own verification docs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Owner can read own verification docs'
  ) THEN
    CREATE POLICY "Owner can read own verification docs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'verification-docs'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Admins can read all verification docs
-- Uses Supabase custom claims: set app_metadata.role = 'admin' on admin users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can read all verification docs'
  ) THEN
    CREATE POLICY "Admins can read all verification docs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'verification-docs'
      AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );
  END IF;
END $$;

-- Owner can update their own verification docs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Owner can update own verification docs'
  ) THEN
    CREATE POLICY "Owner can update own verification docs"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'verification-docs'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Owner can delete their own verification docs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Owner can delete own verification docs'
  ) THEN
    CREATE POLICY "Owner can delete own verification docs"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'verification-docs'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;
