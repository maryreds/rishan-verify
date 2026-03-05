-- ============================================================
-- Rishan Verify — Database Schema
-- Run this in your Supabase SQL Editor (supabase.com > project > SQL Editor)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES — extends Supabase auth.users
-- ============================================================
create type user_role as enum ('candidate', 'admin');
create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected', 'expired');
create type availability_status as enum ('actively_looking', 'open_to_offers', 'not_looking');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role not null default 'candidate',
  full_name text,
  email text,
  phone text,
  location text,
  headline text,
  summary text,
  domains text[] default '{}',
  skills text[] default '{}',
  availability availability_status default 'actively_looking',
  verification_status verification_status default 'unverified',
  verified_at timestamptz,
  verification_expires_at timestamptz,
  resume_file_path text,
  resume_parsed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- WORK EXPERIENCE
-- ============================================================
create table public.work_experience (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  company text not null,
  title text not null,
  start_date date,
  end_date date,
  is_current boolean default false,
  description text,
  created_at timestamptz default now()
);

-- ============================================================
-- EDUCATION
-- ============================================================
create table public.education (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  institution text not null,
  degree text,
  field_of_study text,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

-- ============================================================
-- VERIFICATION REQUESTS
-- ============================================================
create table public.verification_requests (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'completed', 'rejected')),
  document_path text,  -- temporary passport photo path, deleted after review
  document_uploaded_at timestamptz,
  document_deleted_at timestamptz,
  reviewed_by uuid references public.profiles,
  reviewed_at timestamptz,
  result_notes text,
  immigration_status text,  -- e.g. "US Citizen", "H-1B", "F-1 OPT", etc.
  status_valid_until date,
  created_at timestamptz default now()
);

-- ============================================================
-- AUDIT LOG — tracks all sensitive data access
-- ============================================================
create table public.audit_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles,
  action text not null,  -- e.g. 'view_document', 'update_verification', 'delete_document'
  target_type text,      -- e.g. 'verification_request', 'profile'
  target_id uuid,
  metadata jsonb default '{}',
  ip_address text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles: candidates see only their own, admins see all
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Work experience: own data only, admins see all
alter table public.work_experience enable row level security;

create policy "Users can manage own experience"
  on public.work_experience for all
  using (profile_id = auth.uid());

create policy "Admins can view all experience"
  on public.work_experience for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Education: own data only, admins see all
alter table public.education enable row level security;

create policy "Users can manage own education"
  on public.education for all
  using (profile_id = auth.uid());

create policy "Admins can view all education"
  on public.education for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Verification requests: candidates see own, admins see all
alter table public.verification_requests enable row level security;

create policy "Users can view own verification requests"
  on public.verification_requests for select
  using (profile_id = auth.uid());

create policy "Users can create verification requests"
  on public.verification_requests for insert
  with check (profile_id = auth.uid());

create policy "Admins can manage all verification requests"
  on public.verification_requests for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Audit log: admins only
alter table public.audit_log enable row level security;

create policy "Admins can view audit log"
  on public.audit_log for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "System can insert audit log"
  on public.audit_log for insert
  with check (true);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Resumes bucket (persistent)
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false);

create policy "Users can upload own resume"
  on storage.objects for insert
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view own resume"
  on storage.objects for select
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Admins can view all resumes"
  on storage.objects for select
  using (
    bucket_id = 'resumes' and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Verification documents bucket (temporary — photos deleted after review)
insert into storage.buckets (id, name, public)
values ('verification-docs', 'verification-docs', false);

create policy "Users can upload verification docs"
  on storage.objects for insert
  with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Admins can view verification docs"
  on storage.objects for select
  using (
    bucket_id = 'verification-docs' and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete verification docs"
  on storage.objects for delete
  using (
    bucket_id = 'verification-docs' and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_profiles_verification on public.profiles (verification_status);
create index idx_profiles_domains on public.profiles using gin (domains);
create index idx_profiles_skills on public.profiles using gin (skills);
create index idx_verification_requests_status on public.verification_requests (status);
create index idx_audit_log_user on public.audit_log (user_id);
create index idx_audit_log_created on public.audit_log (created_at);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
