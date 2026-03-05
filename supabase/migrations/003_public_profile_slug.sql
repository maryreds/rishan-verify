-- Add public_slug for shareable verification badge URLs
-- Run this in your Supabase SQL Editor AFTER 002

-- Add slug column to profiles
alter table public.profiles
  add column if not exists public_slug text unique;

-- Create index for fast slug lookups
create index if not exists idx_profiles_slug on public.profiles (public_slug);

-- Allow ANYONE (even unauthenticated) to read verified profiles by slug
-- This powers the public /v/[slug] badge page
create policy "Anyone can view verified profiles by slug"
  on public.profiles for select
  using (
    verification_status = 'verified'
    and public_slug is not null
  );

-- Also allow public read of work_experience for verified profiles
create policy "Anyone can view verified profile experience"
  on public.work_experience for select
  using (
    exists (
      select 1 from public.profiles
      where id = profile_id
        and verification_status = 'verified'
        and public_slug is not null
    )
  );

-- Also allow public read of education for verified profiles
create policy "Anyone can view verified profile education"
  on public.education for select
  using (
    exists (
      select 1 from public.profiles
      where id = profile_id
        and verification_status = 'verified'
        and public_slug is not null
    )
  );
