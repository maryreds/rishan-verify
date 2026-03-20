# Rishan Verify — Development Handoff

> **Last updated:** 2026-03-18
> **Live prototype:** https://rishan-verify.vercel.app
> **Project owner:** Mukesh (Rishan) via JSM Consulting

---

## Project Summary

Verified candidate marketplace for the staffing industry. Candidates get verified once across 5 dimensions (identity, work auth, background, certifications, references) and carry a portable digital badge. Employers/staffing firms search pre-verified talent or scan a QR code to skip the 2-5 day verification bottleneck.

**Business case:** `/MVP_Business_Case.md`

---

## Current State (as of 2026-03-18)

### What's Working
- Landing page with verified candidate showcase
- Candidate signup/login (Supabase Auth)
- Candidate dashboard with 3 tabs: Profile, Resume, Verify
- Resume upload + AI parsing (extracts experience, education, skills)
- Work experience & education CRUD
- Manual verification: candidate uploads passport photo, admin reviews
- Admin dashboard: verification queue, approve/reject with immigration status, audit logging, secure document deletion
- Public verified badge page (`/v/[slug]`) with verification status
- Badge preview page

### What's NOT Working / Missing
- **No Persona API** — identity verification is fully manual (admin eyeballs passport)
- **No Checkr** — no background checks
- **No i9 Intelligence / E-Verify** — work auth is manually noted by admin
- **No credential verification** — certifications pillar is unimplemented
- **No automated reference collection** — references pillar is unimplemented
- **No employer portal** — no search, no billing, no subscription management
- **No Stripe** — no payment system
- **No middleware** — no role-based route protection
- **Resume parsing is a placeholder** — `/api/parse-resume` returns mock data, needs real AI service

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-only config) |
| UI Components | shadcn/ui + Radix UI primitives |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (buckets: `resumes`, `verification-docs`) |
| Hosting | Vercel |
| Icons | Lucide React |
| Toasts | Sonner |

---

## File Structure

```
src/
├── middleware.ts                  # Auth guards (protects /dashboard, /admin, /employer)
├── app/
│   ├── layout.tsx                 # Root layout (Inter font, ThemeProvider, Sonner)
│   ├── page.tsx                   # Landing page (hero, employers, pricing, trust)
│   ├── globals.css                # Tailwind v4 theme + shadcn/ui variables
│   ├── login/page.tsx             # Email/password login
│   ├── signup/page.tsx            # Registration with terms
│   ├── auth/callback/route.ts     # Supabase OAuth callback
│   ├── dashboard/
│   │   ├── page.tsx               # Server component (fetches user data)
│   │   └── dashboard-client.tsx   # Client (profile/resume/verify, stats, progress, 5-pillar checklist)
│   ├── admin/
│   │   ├── page.tsx               # Server component (is_admin check, verification queue)
│   │   └── admin-client.tsx       # Client (review/approve/reject)
│   ├── employer/
│   │   ├── page.tsx               # Server component (employer role check, fetches candidates)
│   │   ├── employer-client.tsx    # Client (search, filters, candidate cards, detail modal, saved)
│   │   └── billing/page.tsx       # Stripe billing/pricing page
│   ├── preview-badge/page.tsx     # Badge preview with sample data
│   ├── v/[slug]/page.tsx          # Public verified badge (dynamic)
│   └── api/
│       ├── parse-resume/route.ts  # AI resume parsing (Anthropic + pdf-parse, regex fallback)
│       ├── persona/
│       │   ├── create-inquiry/route.ts  # Start Persona identity verification
│       │   └── webhook/route.ts         # Persona webhook (completed/failed/expired)
│       └── stripe/
│           ├── checkout/route.ts  # Create Stripe Checkout Session
│           └── webhook/route.ts   # Stripe subscription lifecycle events
├── components/
│   ├── theme-provider.tsx         # next-themes wrapper
│   └── ui/                        # 13 shadcn/ui components
│       ├── alert, badge, button, card, dialog, input, label,
│       │   select, separator, sonner, tabs, textarea, tooltip
└── lib/
    ├── utils.ts                   # cn() utility
    ├── supabase.ts                # Browser Supabase client
    ├── supabase-server.ts         # Server Supabase client
    ├── persona.ts                 # Persona API client (createInquiry, getInquiry)
    └── stripe.ts                  # Stripe client + PLANS config
```

---

## Supabase Schema (inferred)

### Tables
- **profiles** — `id, full_name, email, phone, location, headline, summary, skills[], domains[], photo_url, resume_file_path, resume_parsed_at, public_slug, verification_status (unverified|pending|verified|rejected), verified_at, verification_expires_at, is_admin, is_employer, role, stripe_customer_id, stripe_subscription_id, subscription_plan, subscription_status`
- **work_experience** — `id, profile_id, company, title, start_date, end_date, is_current, description`
- **education** — `id, profile_id, institution, degree, field_of_study, start_date, end_date`
- **verification_requests** — `id, profile_id, document_path, document_uploaded_at, status, reviewed_by, reviewed_at, immigration_status, status_valid_until, result_notes, document_deleted_at, persona_inquiry_id`
- **audit_log** — `id, user_id, action, target_type, target_id, metadata, created_at`
- **saved_candidates** — `id, employer_id, candidate_profile_id, saved_at`

### Storage Buckets
- `resumes` — uploaded resume files
- `verification-docs` — passport/ID photos (deleted after verification)

### New columns to add in Supabase
If not already present, these columns need to be added to the `profiles` table:
- `is_admin` (boolean, default false)
- `is_employer` (boolean, default false)
- `stripe_customer_id` (text, nullable)
- `stripe_subscription_id` (text, nullable)
- `subscription_plan` (text, nullable)
- `subscription_status` (text, nullable)

And add `persona_inquiry_id` (text, nullable) to `verification_requests`.

Create the `saved_candidates` table if it doesn't exist.

---

## Completed (2026-03-18)

### Phase 1: Core Integration — DONE
- [x] **Persona API integration** — `src/lib/persona.ts`, `/api/persona/create-inquiry`, `/api/persona/webhook`. Dashboard verify tab has "Verify with Persona" primary + manual upload fallback. Needs `PERSONA_API_KEY`, `PERSONA_TEMPLATE_ID`, `PERSONA_WEBHOOK_SECRET` in `.env.local`.
- [x] **Resume parsing (real AI)** — Rewrote `/api/parse-resume` with pdf-parse for PDF extraction, Anthropic API (claude-haiku-4-5) for structured parsing, regex fallback. Needs `ANTHROPIC_API_KEY`.
- [x] **Middleware & auth guards** — `src/middleware.ts` protects `/dashboard`, `/admin`, `/employer`. Admin checks `is_admin` on profiles table.

### Phase 2: Employer Side — DONE
- [x] **Employer portal** — `/employer` with candidate search, filters (text/location/skills/sort), card grid, detail modal, saved candidates with bookmark toggle.
- [x] **Stripe billing** — `src/lib/stripe.ts` with PLANS config. `/api/stripe/checkout` + `/api/stripe/webhook`. Billing page at `/employer/billing` with 3 pricing tiers. Needs `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_STARTER_PRICE_ID`, `STRIPE_PRO_PRICE_ID`.

### Phase 1-2 UI Improvements — DONE
- [x] Dashboard: quick stats cards, profile completion progress bar, 5-pillar verification checklist
- [x] Landing page: employer value prop section, pricing cards, trust/social proof section, updated nav
- [x] Swapped 3 stock photos (Marcus, Aisha, Jenny) with different Unsplash portraits

---

## Remaining Work (Next Sessions)

### Phase 3: Additional Verification Pillars

#### 1. Checkr Integration (Background Checks)
- API integration for criminal, employment, education checks
- Webhook-driven status updates
- Cost: $30-80/check

#### 2. Credential Verification
- Checkr add-on for professional licenses
- Manual verification for niche certifications
- Cost: ~$12/check

#### 3. Automated References
- Build in-house: email reference request forms
- Track response status
- Display on badge

### Phase 4: Polish & Production

#### 4. UI/UX Polish
- Badge page: visual badge card with per-pillar checkmarks
- Admin: filtering/sorting, bulk actions, audit log viewer
- Mobile responsiveness pass
- Loading skeletons for all pages
- Candidate photo upload in dashboard

#### 5. Production Hardening
- Proper error boundaries
- Rate limiting on API routes
- Input validation/sanitization
- Supabase RLS policies review
- Generated TypeScript types from Supabase schema (`npx supabase gen types`)

#### 6. Supabase Schema Updates
Run these in the Supabase SQL editor to support new features:
```sql
-- Profiles: new columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_employer boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text;

-- Verification requests: Persona support
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS persona_inquiry_id text;

-- Saved candidates table
CREATE TABLE IF NOT EXISTS saved_candidates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(employer_id, candidate_profile_id)
);
```

---

## Environment Variables

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Persona (ready to activate)
PERSONA_API_KEY=
PERSONA_TEMPLATE_ID=
PERSONA_WEBHOOK_SECRET=

# AI resume parsing (ready to activate)
ANTHROPIC_API_KEY=

# Stripe (ready to activate)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# Checkr (future)
CHECKR_API_KEY=
CHECKR_WEBHOOK_SECRET=
```

---

## Quick Start

```bash
cd /Users/maria/Projects/candidates/Rishan-Verify/rishan-verify
npm install
npm run dev
# Open http://localhost:3000
```

---

## Key Decisions Still Needed (from MVP_Business_Case.md)

1. **Platform naming** — "Rishan Verify" vs standalone brand
2. **First 5-10 customer targets** from Mukesh's staffing network
3. **Persona vs manual** — ready to integrate Persona when API key is obtained
4. **Budget approval** — $4,800-$11,650/month operational costs once APIs are live
