# [Platform Name TBD] — MVP Business Case

> **Prepared by:** JSM Consulting Inc.
> **Date:** March 2026
> **Status:** Concept + Working Prototype
> **Prototype:** [Live on Vercel](https://rishan-verify.vercel.app)

---

## 1. Executive Summary

**The problem:** Resume fraud costs US employers an estimated **$600 billion annually**. Over half of all resumes contain misrepresentations, and 60% of those candidates still get hired. Staffing firms — a $184B US market — lose days per candidate on manual verification, and face penalties up to **$28,619 per violation** for work authorization errors.

**The solution:** A verified candidate marketplace where professionals carry a portable, employer-trusted digital badge proving their identity, work authorization, credentials, and references have been verified. Employers and staffing firms search pre-verified talent — or scan a candidate's QR code — and skip the verification bottleneck entirely.

**The ask:** Seed investment to take the working prototype to a production MVP. Key decisions outlined in this document: build vs. partner for verification services, business model, naming, and go-to-market.

---

## 2. The Problem

### The fraud epidemic

| Stat | Number | Source |
|------|--------|--------|
| Resumes containing lies | **55-64%** | Resume.org, StandOut CV |
| Fraudsters who still get hired | **60%** | Resume.org (2024) |
| Annual cost to US employers | **$600B** | Crosschq |
| IT industry falsification rate | **55%** | Crosschq |
| Job seekers who'd use AI to lie | **73%** | Resume.org |

### The verification bottleneck

| Stat | Number | Source |
|------|--------|--------|
| Avg. background check time | **2-5 business days** | ScoutLogic |
| Complex cases | **Up to 2+ weeks** | Exact Background Checks |
| Cost per background check | **$60-$180+ per hire** | InfoMart, Edify Screening |
| Executive-level checks | **$250+** | InfoMart |

### The compliance risk

| Stat | Number | Source |
|------|--------|--------|
| I-9 forms with errors | **65-75%** | Equifax Workforce Solutions |
| Unauthorized workers passing E-Verify | **~54%** | FraudFighter / Westat |
| Penalty per I-9 violation (2025) | **$28,619** | Experian Employer Services |
| ICE audit notices (Feb 2025) | **5,200+** | ICE |

**Bottom line:** Staffing firms spend too much time and money verifying candidates, catch fraud too late, and face massive compliance exposure. There is no single platform that verifies a candidate once and makes that verification portable across employers.

---

## 3. The Solution

A digital verified badge platform with two sides:

### For Candidates
1. **Sign up** and submit verification documents
2. **Get verified** across 5 dimensions (see below)
3. **Receive a digital badge** — shareable link + QR code
4. **Share with any employer** — one verification, used everywhere

### For Employers & Staffing Firms
1. **Search** a marketplace of pre-verified candidates
2. **Scan** a candidate's QR code or badge link
3. **See verification status instantly** — identity, work auth, credentials, references
4. **Skip the 2-5 day verification bottleneck**

### The 5 Verification Pillars

| Pillar | What's Verified | Partner Category |
|--------|----------------|-----------------|
| **Identity** | Government-issued ID + biometric match | Identity verification API |
| **Work Authorization** | US work permit / visa status via E-Verify | E-Verify / I-9 service |
| **Work History** | Past employers, dates, titles | Background check service |
| **Certifications** | Professional licenses, degrees | Credential verification |
| **References** | Professional references contacted and documented | Built in-house |

---

## 4. Market Opportunity

### Total Addressable Market

| Market | Size (2024) | Growth | Source |
|--------|-------------|--------|--------|
| US staffing industry | **$184B** | ~5% YoY | SIA |
| Global staffing industry | **$626B** | ~6% CAGR | SIA / Statista |
| IT staffing (sub-segment) | **$123B** | 3.7% CAGR → $148B by 2030 | Mordor Intelligence |
| Background screening market | **$12-15B** | 12.4% CAGR → $35B by 2031 | Mordor Intelligence |
| Identity verification market | **$13.8B** | 14-18% CAGR → $46-63B by 2033 | Fortune BI, IMARC |

### Why now?

- **AI-powered fraud is accelerating.** 73% of candidates would use AI to misrepresent their background. Verification must keep pace.
- **Remote work = harder to verify.** Distributed teams make in-person document checks impractical.
- **Regulatory pressure is increasing.** ICE audits up, penalties rising, state laws tightening.
- **Market consolidation signals opportunity.** First Advantage acquired Sterling ($2.2B), HireRight taken private ($1.7B), Entrust acquired Onfido — investors are pouring into this space.

---

## 5. Product — Current State

### What's been built (working prototype)

| Component | Status |
|-----------|--------|
| Landing page with verified candidate showcase | Done |
| Floating gallery of verified professional profiles | Done |
| Candidate badge card (photo + verified overlay + QR code) | Done |
| Candidate signup / login flow | Done |
| Profile creation (experience, education, skills) | Done |
| Supabase database (users, profiles, experience, education) | Done |
| Deployed to Vercel | Done |

### Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React, TypeScript |
| Styling | Tailwind CSS |
| Database / Auth | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel |
| Icons | Lucide React |

### What's NOT built yet (MVP scope)

| Feature | Priority | Effort Estimate |
|---------|----------|----------------|
| Verification API integrations (identity, background) | P0 | 2-4 weeks |
| Employer search / marketplace | P0 | 2-3 weeks |
| Employer dashboard | P0 | 2-3 weeks |
| Payment / subscription system (Stripe) | P0 | 1-2 weeks |
| QR code generation + scan verification | P1 | 1 week |
| Admin dashboard | P1 | 1-2 weeks |
| Email notifications | P1 | 1 week |
| Advanced search / filtering | P2 | 1-2 weeks |
| Analytics / reporting | P2 | 1-2 weeks |

---

## 6. Business Model

### Recommendation: Employer-Pays (B2B SaaS)

Two models were considered:

| Model | Candidate Pays | Employer Pays (Recommended) |
|-------|---------------|---------------------------|
| **Who pays** | Candidates buy subscriptions | Employers / staffing firms pay |
| **Revenue per user** | $10-30/month | $200-500/month per seat |
| **Market precedent** | LinkedIn Premium | LinkedIn Recruiter, Indeed, Checkr |
| **Acquisition challenge** | Candidates are price-sensitive, harder to convert | Employers have budgets, clear ROI |
| **Value proposition** | "Get noticed" (nice-to-have) | "Save time, reduce fraud, avoid penalties" (must-have) |
| **Scalability** | Need millions of candidates | Need hundreds of companies |

### Proposed pricing tiers

| Tier | Price | Includes |
|------|-------|---------|
| **Starter** | $199/mo | Up to 50 verified candidate searches/mo, basic filters |
| **Professional** | $499/mo | Unlimited searches, advanced filters, candidate alerts |
| **Enterprise** | Custom | API access, bulk verification, dedicated support, custom integrations |

### Additional revenue streams

| Stream | Model |
|--------|-------|
| **Candidate promotion** | Candidates pay $9-29/mo to boost their profile visibility to employer partners |
| **Verification-as-a-service** | Employers send candidates through our verification for a per-check fee ($25-75) |
| **Data insights** | Anonymized market data for enterprise clients (Phase 2) |

---

## 7. Build vs. Partner — The Core Decision

This is the most important strategic decision. Below is a comparison for each verification pillar.

### Identity Verification

| Option | Provider | Cost | Time to Integrate | Notes |
|--------|----------|------|-------------------|-------|
| **Partner (Recommended)** | Persona | $0 for first 500/mo, then $1/check | 1-2 days | Best free tier, simple API, SOC 2 compliant |
| Partner | Veriff | $0.80-$1.89/check | 1-2 days | Most transparent pricing, 95%+ pass rate |
| Partner | Jumio | ~$0.20-$2.00/check (volume) | 1-2 weeks | Best global coverage, enterprise pricing |
| Partner | Onfido/Entrust | Quote-based (~$60K+/yr) | 1-2 weeks | Best dev docs, enterprise-oriented |
| **Build** | In-house | $500K-$1.5M Year 1 | 6-18 months | Requires ML team, SOC 2 ($50-150K), ongoing $500K+/yr |

**Recommendation: Partner with Persona** — free to start, $1/check at scale, fastest integration, perfect for MVP.

### Background Checks

| Option | Provider | Cost | Time to Integrate | Notes |
|--------|----------|------|-------------------|-------|
| **Partner (Recommended)** | Checkr | $29.99-$79.99/check | 2 weeks avg | Best API, 89% of checks in <1 hour, 100+ integrations |
| Partner | GoodHire | $29.99-$79.99/check | 1-2 weeks | 85% of checks in <1 minute, simplest UX |
| Partner | Sterling | $65-$75+/check | 2-4 weeks | Enterprise, global coverage |
| **Build** | In-house | **Not recommended** | N/A | Must become a CRA (Consumer Reporting Agency) — requires FCRA compliance, state licensing, massive legal overhead |

**Recommendation: Partner with Checkr** — industry standard, best API docs, fast turnaround, reasonable pricing.

### Work Authorization (E-Verify / I-9)

| Option | Provider | Cost | Notes |
|--------|----------|------|-------|
| **Partner (Recommended)** | i9 Intelligence | $50/mo all-inclusive | Best value for SMBs |
| Partner | Equifax I-9 HQ | Subscription + per-completion | Enterprise-grade |
| Partner | Verifyi9 | $250/yr + $50/location setup | Budget option |
| E-Verify direct | Government | Free (but hidden costs in staff time) | No API, web portal only |

**Recommendation: Partner with i9 Intelligence** — affordable, automated, audit trail included.

### Certifications & Licenses

| Option | Provider | Cost | Notes |
|--------|----------|------|-------|
| **Partner (Recommended)** | Checkr add-on | $12/check | Simple add-on to background check |
| Partner | Certemy | Custom pricing | Enterprise, bulk license tracking |
| Build | In-house | Impractical | Databases are proprietary, no access |

**Recommendation: Use Checkr's license verification add-on** at $12/check.

### References

| Option | Cost | Notes |
|--------|------|-------|
| **Build in-house (Recommended)** | Development time only | Automated email/form to listed references. Simple to build, no API needed. |

### Total Partner Cost Estimate (MVP)

| Component | Cost Model | Est. Monthly (100 verifications) |
|-----------|-----------|--------------------------------|
| Identity (Persona) | Free first 500, then $1/check | **$0** (in free tier) |
| Background (Checkr) | $29.99-$79.99/check | **$3,000-$8,000** |
| I-9 / E-Verify | $50/mo flat | **$50** |
| Certifications (Checkr add-on) | $12/check | **$1,200** |
| References (in-house) | Built in platform | **$0** |
| **TOTAL** | | **$4,250-$9,250/mo** |

### vs. Building From Scratch

| Cost Category | Year 1 Estimate |
|--------------|----------------|
| AI/ML development (OCR, facial recognition) | $75,000-$200,000 |
| Platform development | $20,000-$100,000 |
| SOC 2 compliance | $50,000-$150,000 |
| Team salaries (engineers, compliance) | $750,000/yr |
| Infrastructure & tools | $100,000/yr |
| **TOTAL Year 1** | **$1,000,000-$1,500,000+** |
| **Ongoing annual** | **$500,000-$750,000/yr** |

**The math is clear: partnering costs ~$50K-110K/year at 100 verifications/month. Building costs $1M+ in Year 1 alone.**

---

## 8. Go-to-Market Strategy

### Phase 1: Network Launch (Months 1-3)

| Action | Detail |
|--------|--------|
| **Anchor client** | JSM Consulting (sister company) — use as proof of concept |
| **Mukesh's network** | Personal outreach to staffing firm contacts |
| **Target** | 5-10 staffing firms in IT staffing |
| **Goal** | 50+ verified candidates, 5 paying employer accounts |

### Phase 2: Industry Expansion (Months 4-8)

| Action | Detail |
|--------|--------|
| **IT staffing vertical** | Targeted outreach to IT staffing firms (highest fraud risk, highest value) |
| **Content marketing** | Blog posts on verification fraud stats, compliance risk |
| **Partnerships** | Integrate with ATS platforms (Bullhorn, JobDiva, etc.) |
| **Goal** | 500+ verified candidates, 25 paying accounts |

### Phase 3: Multi-Industry (Months 9-12+)

| Action | Detail |
|--------|--------|
| **Healthcare staffing** | High compliance requirements, natural fit |
| **Enterprise direct** | Large employers with in-house recruiting |
| **Candidate-side growth** | Launch candidate promotion tier |
| **Goal** | 2,000+ verified candidates, 100+ paying accounts |

---

## 9. Platform Name

The platform needs a name that communicates trust, verification, and professionalism. "Rishan" is the parent company name — the platform may benefit from its own brand identity.

### Options to consider

| Name | Pros | Cons |
|------|------|------|
| **Rishan Verify** | Ties to parent company, straightforward | Less memorable, doesn't stand alone |
| **TrueHire** | Clear value prop, professional | May have trademark conflicts |
| **VerifiedPro** | Self-explanatory, candidate-friendly | Generic |
| **ClearBadge** | Unique, visual (badge concept) | Less corporate |
| **ProvenTalent** | Strong employer appeal | Broad |
| **[Custom Name]** | Can be crafted to be unique and ownable | Requires branding investment |

**Decision needed:** Does Mukesh want the platform branded under Rishan, or as a standalone product? A standalone brand may have more market appeal and flexibility, but a Rishan sub-brand leverages existing recognition.

---

## 10. Next Steps & Ask

### Decisions needed from Mukesh

| # | Decision | Options | Impact |
|---|----------|---------|--------|
| 1 | **Build vs. Partner** | Partner with APIs (recommended) vs. Build from scratch | $50K/yr vs. $1M+ Year 1 |
| 2 | **Business Model** | Employer-pays (recommended) vs. Candidate-pays | Revenue model, pricing |
| 3 | **Platform Name** | Rishan Verify vs. Standalone brand | Branding, domain, marketing |
| 4 | **MVP Budget** | Approve development budget (see below) | Timeline to launch |
| 5 | **First customers** | Identify 5-10 staffing firms from network | Go-to-market |

### MVP Budget Estimate (Partner Path)

> **Key advantage:** The platform is being developed in-house using AI-assisted development (Claude AI + internal team), eliminating the largest typical startup cost — engineering. A working prototype is already live. Equivalent outsourced development would cost $15,000-$25,000.

| Line Item | One-Time | Monthly |
|-----------|----------|---------|
| Development (in-house + AI-assisted) | **$0** | — |
| Claude AI subscription (development tool) | — | $20-200 |
| Verification API costs (100 checks/mo) | — | $4,250-$9,250 |
| Hosting (Vercel + Supabase) | — | $50-200 |
| Domain + branding | $500-2,000 | — |
| Stripe payment processing | — | 2.9% + $0.30/transaction |
| Marketing (initial) | $2,000-5,000 | $500-2,000 |
| **TOTAL** | **$2,500-$7,000** | **$4,800-$11,650** |

*For context: hiring a dev team for equivalent work would cost $15,000-$25,000 one-time or $8,000-$15,000/month for contractors.*

### Timeline to MVP

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Partner selection + contracts | 2 weeks | Signed agreements with Persona, Checkr, i9 Intelligence |
| API integration | 3-4 weeks | Verification flow working end-to-end |
| Employer dashboard + search | 2-3 weeks | Employers can search and view verified candidates |
| Payment system (Stripe) | 1-2 weeks | Subscription billing live |
| Testing + polish | 1-2 weeks | QA, mobile responsiveness, edge cases |
| **TOTAL** | **9-13 weeks** | Production MVP |

---

## Appendix: Sources

- Staffing Industry Analysts (SIA) — US and global staffing market data
- Resume.org — Resume fraud statistics (2024)
- Crosschq — Resume fraud cost estimates
- US Department of Labor — Cost of bad hire benchmarks
- Mordor Intelligence — IT staffing and background screening market size
- Fortune Business Insights / IMARC — Identity verification market
- Equifax Workforce Solutions — I-9 error rates
- ICE — Immigration audit data
- Checkr, Persona, Veriff, GoodHire — Published pricing pages
- Vanta, Drata — SOC 2 compliance cost data
- Financial Models Lab — Identity verification startup cost estimates

---

<!-- FORMATTING INSTRUCTIONS FOR CLAUDE COWORK

When converting this document to a styled Google Doc, apply the following design system
to make it visually consistent with the Rishan Verify prototype website:

## COLOR PALETTE
- Page background: White (#FFFFFF) — standard Google Doc
- Primary text: Dark navy (#0F172A) — use for headings and body
- Accent gradient: Blue (#2563EB) to Violet (#7C3AED) — use blue for section headers
- Success/Verified: Emerald (#22C55E) — use for checkmarks, positive callouts, recommendation highlights
- Muted text: Slate gray (#94A3B8) — use for captions, footnotes, source attributions
- Warning/attention: Amber (#F59E0B) — use for cost figures, risk callouts
- Negative/risk: Red (#EF4444) — use for fraud stats, penalties, problems

## TYPOGRAPHY
- Title: 28pt, Bold, #2563EB (blue)
- Section headers (##): 18pt, Bold, #0F172A with a thin blue (#2563EB) underline or left border
- Sub-headers (###): 14pt, Bold, #334155
- Body text: 11pt, Regular, #334155, line spacing 1.3
- Table headers: 11pt, Bold, white text on #1E293B (dark navy) background
- Table body: 10pt, Regular, alternating white/#F8FAFC row backgrounds
- Callout boxes: Light blue background (#EFF6FF) with left blue border for recommendations
- Risk callout boxes: Light red background (#FEF2F2) with left red border for warnings/penalties

## LAYOUT GUIDELINES
- Max width: Use 1-inch margins (standard)
- Tables: Full-width, clean borders (thin #E2E8F0 lines), no heavy gridlines
- Page breaks: Before each numbered section
- Header/footer: Add "CONFIDENTIAL — JSM Consulting Inc." in footer, light gray
- Cover page: Platform name large and centered, "MVP Business Case" subtitle, date, "Prepared by JSM Consulting Inc." — consider adding a gradient blue-to-violet accent bar

## SPECIFIC FORMATTING
- The "Executive Summary" section should have a light blue (#EFF6FF) background box
- Bold numbers/dollar figures in tables for scannability
- The "Build vs. Partner" cost comparison ($50K vs $1M+) should be visually highlighted — perhaps a side-by-side comparison box with green (partner) vs red (build) headers
- Recommendation rows in tables should have a subtle emerald (#22C55E) left border or green background tint
- Source attributions should be in 9pt italic gray text

## DESIGN PHILOSOPHY
- Clean, modern, high-trust — like a fintech pitch deck
- Generous white space between sections
- Data-forward: tables and numbers should be the visual anchors
- Minimal decoration — let the data speak
- Every section should be scannable in under 30 seconds
- Think: McKinsey meets a modern SaaS pitch deck

-->
