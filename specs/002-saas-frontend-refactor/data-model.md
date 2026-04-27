# Data Model: SaaS Frontend Refactor

**Feature**: 002-saas-frontend-refactor  
**Phase**: 1 — Design  
**Status**: Complete

---

## Overview

This document describes the frontend-side data shapes. No new backend database tables are introduced by this feature. All models here are either TypeScript types consumed by React components, or shape contracts for JWT payload claims received from the existing FastAPI backend.

---

## 1. `UserSession`

Represents an authenticated or unauthenticated visitor. Unauthenticated visitors are represented as a `guest` session — the session is **never null**.

```ts
// lib/auth.ts
export interface UserSession {
  id:     string | null;   // JWT `sub` claim. null for guests.
  name:   string | null;   // JWT `name` claim. null for guests.
  locale: 'ar' | 'en';     // JWT `locale` claim. Defaults to 'ar'.
  tier:   UserTier;         // JWT `tier` claim. 'guest' when unauthenticated.
}

export type UserTier = 'guest' | 'free' | 'pro' | 'enterprise';

// Guest singleton — returned when no valid cookie is found
export const GUEST_SESSION: UserSession = {
  id:     null,
  name:   null,
  locale: 'ar',
  tier:   'guest',
};
```

**Validation rules**:
- `tier` MUST be one of the four enum values; any other value from the JWT MUST be coerced to `'guest'`
- `locale` MUST be `'ar'` or `'en'`; any other value MUST default to `'ar'` (Principle III)
- Signature verification is the backend's responsibility; the frontend decodes claims without verifying

**State transitions**:
```
guest  ─[sign up / sign in]──→  free
free   ─[upgrade to Pro]──────→  pro
pro    ─[enterprise sales]────→  enterprise
any    ─[sign out]────────────→  guest
```

---

## 2. `PricingPlan`

Static metadata for the three tiers displayed on the Landing Page pricing section and consumed by `<PricingCard>`.

```ts
// lib/pricing.ts
export interface PricingPlan {
  readonly id:           PlanId;
  readonly tier:         0 | 1 | 2;     // 0=free, 1=pro, 2=enterprise
  readonly monthlyPrice: number | null;  // null = "Contact Us" or placeholder
  readonly highlighted:  boolean;        // true for "recommended" plan (Pro)
  readonly ctaVariant:   'default' | 'outline';
}

export type PlanId = 'free' | 'pro' | 'enterprise';
```

**i18n keys** (all user-facing text lives in `ar.json` / `en.json`):

```
pricing.free.name
pricing.free.tagline
pricing.free.price          → "$0 / month"
pricing.free.cta            → "Get Started Free"
pricing.free.features       → [array of feature strings]

pricing.pro.name
pricing.pro.tagline
pricing.pro.price           → placeholder ("$X / month")
pricing.pro.cta             → "Start Pro Trial"
pricing.pro.features        → [array of feature strings]

pricing.enterprise.name
pricing.enterprise.tagline
pricing.enterprise.price    → "Contact Us"
pricing.enterprise.cta      → "Contact Sales"
pricing.enterprise.features → [array of feature strings]

pricing.disclaimer          → mandatory regulatory disclaimer
```

---

## 3. `ServiceCard`

Represents one service tile on the Landing Page features section and the Dashboard.

```ts
// lib/services.ts (new, static)
export interface ServiceCard {
  readonly id:            string;
  readonly icon:          string;       // Lucide icon name (string key)
  readonly href:          string;       // Relative URL, e.g., "/stock"
  readonly requiredTier:  UserTier;
  readonly available:     boolean;      // false = "coming soon"
}
```

**i18n keys**: `services.[id].title`, `services.[id].description`

Services list (static):
| id | requiredTier | available |
|----|-------------|-----------|
| `stock-screener` | `free` | true |
| `halal-verdict` | `free` | true |
| `news-agent` | `free` | true (3 headlines) |
| `arima-forecast` | `pro` | true |
| `portfolio-allocator` | `pro` | true |
| `sector-explorer` | `pro` | true |
| `risk-dashboard` | `pro` | true |
| `live-monitoring` | `pro` | false (coming soon) |

---

## 4. `SignInGateState`

Internal component state for the soft sign-in gate on the Stock Detail page. Not stored server-side.

```ts
// hooks/useSoftGate.ts
interface SoftGateState {
  gateOpen:    boolean;   // becomes true ≤300ms after teaser renders
  hasTriggered: boolean;  // guard: fire exactly once per page load
}
```

**Trigger conditions** (derived from FR-018):
- `shouldFire === true` when: `teaserData !== null && tier === 'guest'`
- `shouldFire === false` (gate suppressed) when: `teaserData === null` (fetch error or loading)

---

## 5. `UpgradeGateProps`

Props interface for the `<UpgradeGate>` component wrapping Pro/Enterprise content.

```ts
// components/ui/UpgradeGate.tsx
export interface UpgradeGateProps {
  requiredTier:  'pro' | 'enterprise';
  featureName:   string;      // i18n key for the feature name shown in the prompt
  children:      ReactNode;   // The content to render when tier check passes
}
```

**Behaviour**:
- `tier === 'guest'` → redirect to sign-in gate (handled at page level, not here)
- `tier === 'free'` and `requiredTier === 'pro'` → render upgrade prompt (not children)
- `tier === 'pro'` and `requiredTier === 'enterprise'` → render upgrade prompt
- Otherwise → render `children` directly

---

## 6. `SignInGateModalProps`

Props interface for the non-dismissible sign-in gate modal (FR-018 / FR-019).

```ts
// components/ui/SignInGateModal.tsx
export interface SignInGateModalProps {
  isOpen:   boolean;
  returnTo: string;   // Sanitized pathname. Passed as ?returnTo= on CTA href.
}
```

No `onClose` prop — the modal is intentionally non-dismissible.

---

## Entity Relationship Diagram

```
UserSession
  ├── tier ─────────────→ PricingPlan.id  (display)
  ├── tier ─────────────→ UpgradeGateProps.requiredTier  (gate check)
  └── id (null=guest) ──→ SignInGateState.shouldFire  (soft gate trigger)

PricingPlan
  └── id ───────────────→ ServiceCard.requiredTier  (availability check)

SignInGateState
  └── returnTo ─────────→ SignInGateModalProps.returnTo  (CTA URL)
```
