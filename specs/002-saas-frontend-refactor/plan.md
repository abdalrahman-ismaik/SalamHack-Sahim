# Implementation Plan: SaaS Frontend Refactor

**Branch**: `002-saas-frontend-refactor` | **Date**: 2026-04-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-saas-frontend-refactor/spec.md`

## Summary

Refactor the existing Next.js 14 frontend from a single-page analysis tool
into a full SaaS web application. The refactor delivers: a marketing landing
page with 3-tier pricing, authenticated dashboard with tier-gated service
cards, a soft sign-in gate (try-then-wall) on the stock detail page, and a
shared Tailwind UI component library (`components/ui/`) covering all page
patterns. All pages are bilingual (Arabic RTL / English LTR) and WCAG 2.1 AA
accessible. Guest visitors are represented by `tier: "guest"` in `UserSession`
— no null checks. The backend tier enforcement (spec 001) is authoritative;
all client-side gating is cosmetic only.

**Team composition**: 4 members — Frontend Lead, UX/Accessibility, Backend
(JWT tier claims), AI/Integration. Delivery window: Apr 27–May 1 2026.

## Technical Context

**Language/Version**: TypeScript 5.x · Next.js 14 (App Router)
**Primary Dependencies**:
- `next-intl` — i18n, RTL/LTR, bilingual message files
- `tailwindcss` + `tailwind-merge` — sole styling mechanism; `dark:` + `rtl:` variants
- `framer-motion` — page transitions and modal animations (disabled when `prefers-reduced-motion`)
- `react-hook-form` + `zod` — form validation, errors in active locale
- `jose` or `next-auth` — JWT session reading for `useUserTier()` hook
- `focus-trap-react` (or custom) — focus trap in `SignInGateModal` on all devices

**Storage**: No new storage. Static pricing data in `frontend/src/lib/pricing.ts`.
Session JWT from existing backend (spec 001). No database changes.

**Testing**: Jest + React Testing Library (component tests) · existing pytest (backend — unchanged)

**Target Platform**: Netlify (frontend static/SSR) · Node 18+

**Project Type**: Full-stack web application — frontend-only refactor (backend API unchanged)

**Performance Goals**: Dashboard interactive ≤ 3 s on 3G. Teaser result on
stock detail page renders ≤ 2 s before gate fires. Lighthouse Performance ≥ 80.

**Constraints**:
- Tailwind CSS only — no inline styles, no separate CSS files except `globals.css`
- Framer Motion animations MUST be disabled when `prefers-reduced-motion: reduce`
- Stripe billing out of scope; pricing is static placeholder data
- Auth session management delegated to existing backend (spec 001)
- `SignInGateModal` focus trap applies on all devices (keyboard + touch + assistive tech)
- `returnTo` redirect parameter MUST be validated against same-origin allowlist (open redirect prevention)
- No Forgot Password, Upload Passport, or admin pages (per sandbox mocking guidelines)

**Scale/Scope**: ~8 routes · ~12 new/refactored components · 0 new API endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate Question | Status |
|-----------|---------------|--------|
| I. Demo-Day First | Do all P1–P2 stories (landing, dashboard, soft gate, component library) ship before May 1? | ✅ PASS — 4-day delivery window; P1/P2 prioritised; component library built first as foundation |
| III. Arabic-First | Are all new components sourced from `ar.json` / `en.json` via `next-intl`? No hardcoded strings? | ✅ PASS — FR-003 and FR-019 explicitly prohibit hardcoded strings; clarification Q1–Q5 all reinforce bilingual requirement |
| IV. Halal Integrity | Does every Halal verdict teaser include the non-removable disclaimer? | ✅ PASS — teaser (FR-017) shows verdict label only; full disclaimer rendered post-login per spec 001 components |
| V. Regulatory Compliance | Are all score/projection previews labelled as informational, not licensed advice? | ✅ PASS — teaser shows Traffic Light badge + Halal label only, no numeric scores (clarification Q1); disclaimer inherited from spec 001 |
| VII. Security | No hardcoded secrets? JWT tier read client-side for cosmetic gating only? `returnTo` URLs validated? | ✅ PASS — `useUserTier()` reads existing JWT; `returnTo` MUST be validated against same-origin allowlist before redirect |
| VIII. SaaS Architecture | Landing page is public; all other pages require auth or use soft gate; tier enforced server-side | ✅ PASS — FR-004 updated: hard redirect for all routes except `/`, `/auth/*`, and stock detail (soft gate); server enforcement unchanged |
| IX. Component & Accessibility | Tailwind-only, keyboard nav, ARIA, WCAG AA, focus trap on all devices | ✅ PASS — FR-011, FR-012, FR-013, FR-014, FR-019 address all requirements; clarification Q5 confirms all-device focus trap |

**Gate result**: All 7 applicable principles PASS. Proceeding to Phase 0.

**Security note on `returnTo`**: FR-005 and FR-019 specify `returnTo` query
parameters. Implementation MUST validate the value against an allowlist of
same-origin paths before redirect to prevent open redirect attacks (OWASP A01).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── layout.tsx               # Root layout: nav, footer, locale provider
│   │       ├── page.tsx                 # Landing page (public) — REFACTOR
│   │       ├── auth/
│   │       │   ├── signin/page.tsx      # Sign In (public) — NEW
│   │       │   └── signup/page.tsx      # Sign Up (public) — NEW
│   │       ├── dashboard/
│   │       │   └── page.tsx             # Dashboard (auth-required) — NEW
│   │       └── stock/
│   │           └── [ticker]/
│   │               └── page.tsx         # Stock detail (soft-gated) — REFACTOR
│   ├── components/
│   │   ├── ui/                          # NEW: shared primitive library
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── UpgradeGate.tsx
│   │   │   ├── PricingCard.tsx
│   │   │   ├── SectionHeading.tsx
│   │   │   └── SignInGateModal.tsx
│   │   ├── landing/                     # NEW: landing page sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   └── FooterSection.tsx
│   │   ├── dashboard/                   # NEW: dashboard widgets
│   │   │   ├── TierBadge.tsx
│   │   │   └── ServiceCardGrid.tsx
│   │   ├── AllocatorForm.tsx            # EXISTING — wrap with UpgradeGate
│   │   ├── ArimaChart.tsx               # EXISTING — wrap with UpgradeGate
│   │   ├── HalalPanel.tsx               # EXISTING — keep as-is
│   │   ├── NewsPanel.tsx                # EXISTING — tier-gate full feed
│   │   ├── RiskPanel.tsx                # EXISTING — wrap with UpgradeGate
│   │   ├── SectorPanel.tsx              # EXISTING — wrap with UpgradeGate
│   │   └── TrafficLightBadge.tsx        # EXISTING — used in teaser
│   ├── hooks/
│   │   └── useUserTier.ts               # NEW: reads JWT tier claim
│   ├── lib/
│   │   ├── api.ts                       # EXISTING
│   │   ├── types.ts                     # EXISTING — extend with guest tier
│   │   └── pricing.ts                   # NEW: static pricing plan data
│   └── messages/
│       ├── ar.json                      # EXISTING — extend with new keys
│       └── en.json                      # EXISTING — extend with new keys
└── middleware.ts                        # UPDATE: soft-gate exemption for /stock/[ticker]
```

## Complexity Tracking

No constitution violations requiring justification. All complexity is
justified by spec requirements (FR-001 through FR-019).
