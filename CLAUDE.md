# Rishan Verify — Claude Code Instructions

## What This App Is
Rishan Verify is a **verified candidate marketplace** — professionals submit their identity and work authorization documents for human review, then receive a public "verified badge" profile page they can share with recruiters.

**Live URL:** https://rishan-verify.vercel.app
**GitHub:** https://github.com/maryreds/rishan-verify (make private when ready)

---

## Stack
| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, TypeScript, React 19) |
| Styling | Tailwind CSS v4 + shadcn/ui (New York) |
| UI Components | shadcn/ui — `src/components/ui/` |
| Animations | framer-motion (landing page) |
| Theming | next-themes (dark/light mode) |
| Toasts | sonner |
| Backend / DB | Supabase (PostgreSQL + RLS + Auth) |
| Icons | lucide-react |
| Images | next/image — use `unoptimized` prop for external QR/Unsplash URLs |
| Deploy | Vercel (auto-deploy from `main`) |

---

## Key Commands
```bash
npm run dev      # local dev at http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
npx vercel --prod  # deploy to production
```

---

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Landing page (composes section components)
│   ├── loading.tsx           # Global loading skeleton
│   ├── login/page.tsx        # Login (shadcn forms)
│   ├── signup/page.tsx       # Signup (shadcn forms)
│   ├── dashboard/
│   │   ├── page.tsx          # Server component (data fetching)
│   │   ├── dashboard-client.tsx  # Client component (shadcn UI)
│   │   └── loading.tsx       # Dashboard skeleton
│   ├── admin/
│   │   ├── page.tsx          # Server component
│   │   ├── admin-client.tsx  # Client component (shadcn UI)
│   │   └── loading.tsx       # Admin skeleton
│   ├── v/[slug]/
│   │   ├── page.tsx          # Public verified profile (semantic tokens)
│   │   ├── loading.tsx       # Profile skeleton
│   │   └── not-found.tsx     # 404 for missing profiles
│   ├── preview-badge/page.tsx  # Demo profile (Ananya Mehta, enamel pins)
│   └── api/parse-resume/     # AI resume parser endpoint
├── components/
│   ├── ui/                   # shadcn/ui components (DO NOT edit directly)
│   │   ├── button.tsx, card.tsx, input.tsx, label.tsx, textarea.tsx
│   │   ├── tabs.tsx, badge.tsx, skeleton.tsx, dialog.tsx
│   │   ├── select.tsx, separator.tsx, dropdown-menu.tsx
│   │   ├── avatar.tsx, alert.tsx, tooltip.tsx, sonner.tsx
│   │   └── ... (15 components total)
│   ├── shared/               # Reusable app-level components
│   │   ├── site-header.tsx   # Nav bar (landing + app variants)
│   │   ├── site-footer.tsx   # Footer
│   │   ├── theme-toggle.tsx  # Dark/light mode toggle
│   │   ├── page-shell.tsx    # Layout wrapper for dashboard/admin
│   │   └── verification-badge.tsx  # Status badge (verified/pending/rejected)
│   └── landing/              # Landing page sections (framer-motion)
│       ├── landing-nav.tsx   # Landing nav (fade from top)
│       ├── hero-section.tsx  # Hero + badge card (staggered fade-up)
│       ├── stats-bar.tsx     # Count-up stats (scroll-triggered)
│       ├── floating-gallery.tsx  # Animated profile cards
│       ├── how-it-works.tsx  # 3-step cards (stagger from left)
│       ├── features-section.tsx  # Photo grid + features
│       ├── testimonials-section.tsx  # Testimonial cards
│       ├── cta-section.tsx   # Final CTA (scale-up)
│       └── landing-footer.tsx  # Landing footer
└── lib/
    ├── utils.ts              # cn() helper (clsx + tailwind-merge)
    ├── supabase-browser.ts   # Supabase browser client
    └── supabase-server.ts    # Supabase server client
```

---

## Design Token System (Three-Layer)

### Layer 1: Primitives (in globals.css `@theme inline`)
Raw colors defined as CSS custom properties in oklch format.

### Layer 2: Semantic Tokens (`:root` and `.dark`)
| Token | Purpose | Light | Dark |
|-------|---------|-------|------|
| `--background` | Page background | white | #06060f |
| `--foreground` | Primary text | near-black | white |
| `--card` | Card background | white | #0d0d1a |
| `--muted` | Subdued background | slate-50 | #161625 |
| `--muted-foreground` | Secondary text | slate-500 | slate-400 |
| `--border` | Borders | slate-200 | white/10 |
| `--primary` | Brand accent | blue-600 | blue-500 |
| `--destructive` | Error/reject | red-600 | red-500 |

### Layer 3: Component Usage
- **Always use semantic classes**: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-muted`
- **Never use hardcoded grays** (`bg-white`, `text-gray-600`, `border-gray-100`) in dashboard/admin/auth pages
- **Status colors are OK**: emerald for verified, amber for pending, red for rejected — these are intentional and include `dark:` variants
- **Landing page**: Uses semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `border-border`) — supports both light and dark modes via theme toggle.

---

## Theming Rules
- **Dashboard, Admin, Auth pages**: Use semantic tokens, respect dark/light toggle
- **Landing page**: Uses semantic tokens, supports light/dark via tab toggle in nav
- **Preview-badge page**: Always dark (same as landing)
- **Public profile (`/v/[slug]`)**: Uses semantic tokens, supports dark/light
- **ThemeProvider**: Wraps app in `layout.tsx`, default theme is "light", system detection enabled

---

## Design System (Visual)
- **Style:** Clean, editorial, light-first design (inspired by coaching program reference)
- **Fonts:** DM Serif Display (headlines, `font-serif`), Inter (body, `font-sans`)
- **Accent:** Emerald green `#22c55e` (emerald-500) — used for verified badges, headline accents, CTA highlights
- **Landing palette:** Light mode = white bg, subtle gray borders, black text. Dark mode = #06060f bg, dark cards, white text.
- **Theme toggle:** Segmented pill (Light | Dark) in nav bar, powered by next-themes

### Badge Card Pattern (used on landing hero + preview-badge)
Full-bleed photo → dark gradient overlay (`to top`, heavy at bottom) → name + VERIFIED chip overlaid.

### Floating Gallery
Horizontal scrollable row of profile cards with fade-edge gradients. Cards: `bg-card border-border`, photo + ShieldCheck VERIFIED badge + name/role.

### Enamel Pin Badges (preview-badge page)
Two-layer approach: outer div (gold gradient + padding = rim) → inner div (radial gradient = enamel fill). Pin clasp is a small separate div with `marginBottom: -4`. Pins are 108px. Text inside uses `overflow: hidden` on the enamel div — keep sublabel `letterSpacing` ≤ 0.04em and `fontSize` ≤ 6px to avoid clipping at circle edges.

---

## Animations (framer-motion)
All landing page animations use `whileInView` with `viewport={{ once: true }}` for scroll-triggered reveals:
- **Nav**: Fade in from top
- **Hero text**: Staggered fade-up (100ms apart per element)
- **Hero badge card**: Fade up + scale from 0.96
- **Stats**: Count-up numbers on scroll into view
- **How It Works**: Cards stagger in from left (150ms apart)
- **Features**: Photo grid + feature items fade up with stagger
- **Testimonials**: Cards fade up with stagger
- **CTA**: Scale up from 0.95

**TypeScript note**: framer-motion ease arrays need `as const` assertion:
```tsx
ease: [0.22, 1, 0.36, 1] as const
```

---

## Responsive Breakpoints
The preview tool viewport is ~618px (below Tailwind's `sm` at 640px). Use `sm:flex-row` for side-by-side layouts — verify at 900px+ width to confirm they work.

---

## Supabase
- Client ID stored in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- All tables have RLS enabled
- Pending SQL migrations to run in Supabase SQL Editor:
  - `002_` — fixes experience/education RLS insert
  - `003_` — enables public profile slugs
- Public profile route: `/v/[slug]`

---

## Floating Gallery Profiles
Photos from Unsplash — use `?w=320&h=400&fit=crop&crop=face`. Names are intentionally matched to the visible ethnicity of each photo. When adding profiles, keep that consistency.

Current 14 profiles: Rachel Williams, Marcus Thompson, Aisha Davis, Jenny Liu, Sofia Rivera, Imani Carter, Arjun Patel, Ryan Mitchell, James O'Brien, Natalia Gomez, Priya Sharma, Kevin Park, Emma Scott, Vikram Nair.

---

## Version History
| Tag | Description |
|-----|-------------|
| `v-pre-visual-upgrade` | Original MVP before visual upgrade |
| `v1-visual-upgrade` | Phase 1: shadcn/ui, design tokens, dark mode, animations, loading states |
| `v-pre-editorial-redesign` | Before editorial redesign (dark-only landing) |
| `v2-editorial-redesign` | Phase 2: Clean editorial landing, light-first, DM Serif Display, theme toggle tab, all sections redesigned |

---

## Pending Tasks
- [ ] Run Supabase migrations 002 and 003 in SQL Editor
- [ ] Make GitHub repo private
- [ ] Replace Unsplash placeholder photos with AI-generated faces (Generated Photos or similar) for production
