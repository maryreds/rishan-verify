-- Fix: RLS policies for work_experience and education need WITH CHECK for inserts
-- Run this in your Supabase SQL Editor
-- This version is safe to run multiple times (idempotent)

-- ============================================================
-- WORK EXPERIENCE — drop ALL possible policies, then recreate
-- ============================================================
drop policy if exists "Users can manage own experience" on public.work_experience;
drop policy if exists "Users can view own experience" on public.work_experience;
drop policy if exists "Users can insert own experience" on public.work_experience;
drop policy if exists "Users can update own experience" on public.work_experience;
drop policy if exists "Users can delete own experience" on public.work_experience;

create policy "Users can view own experience"
  on public.work_experience for select
  using (profile_id = auth.uid());

create policy "Users can insert own experience"
  on public.work_experience for insert
  with check (profile_id = auth.uid());

create policy "Users can update own experience"
  on public.work_experience for update
  using (profile_id = auth.uid());

create policy "Users can delete own experience"
  on public.work_experience for delete
  using (profile_id = auth.uid());

-- ============================================================
-- EDUCATION — drop ALL possible policies, then recreate
-- ============================================================
drop policy if exists "Users can manage own education" on public.education;
drop policy if exists "Users can view own education" on public.education;
drop policy if exists "Users can insert own education" on public.education;
drop policy if exists "Users can update own education" on public.education;
drop policy if exists "Users can delete own education" on public.education;

create policy "Users can view own education"
  on public.education for select
  using (profile_id = auth.uid());

create policy "Users can insert own education"
  on public.education for insert
  with check (profile_id = auth.uid());

create policy "Users can update own education"
  on public.education for update
  using (profile_id = auth.uid());

create policy "Users can delete own education"
  on public.education for delete
  using (profile_id = auth.uid());
