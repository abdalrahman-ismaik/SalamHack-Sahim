# Contract: Frontend Routing

**Feature**: 002-saas-frontend-refactor  
**Phase**: 1 — Design  
**Status**: Complete

---

## Overview

This document defines the route contracts for the سهم ($ahim) SaaS frontend. It specifies which routes are public, which use the soft sign-in gate, and which require authentication. Middleware is the enforcing layer for protected routes; the soft gate is enforced at the page component level.

---

## Route Registry

| Route Pattern | Auth Required | Gate Type | Notes |
|---------------|--------------|-----------|-------|
| `/[locale]` | No | None | Landing Page — always public |
| `/[locale]/auth/signin` | No | None | Sign In page |
| `/[locale]/auth/signup` | No | None | Sign Up page |
| `/[locale]/stock/[ticker]` | No | **Soft gate** | Teaser + `<SignInGateModal>` |
| `/[locale]/dashboard` | **Yes** | Hard redirect | → `/[locale]/auth/signin?returnTo=[path]` |
| `/[locale]/sector` | **Yes** | Hard redirect | → `/[locale]/auth/signin?returnTo=[path]` |
| `/[locale]/allocator` | **Yes** | Hard redirect | → `/[locale]/auth/signin?returnTo=[path]` |

**Locale**: Either `ar` (default) or `en`.

---

## Middleware Contract

File: `frontend/src/middleware.ts`

### Input
- Incoming `NextRequest` with pathname and optional `auth_token` httpOnly cookie.

### Rules
1. Run `intlMiddleware` (next-intl) first on all requests.
2. Check if the pathname matches any `PUBLIC_PATTERNS` (see below).
3. If NOT public AND `auth_token` cookie is absent → issue 302 redirect.
4. If public OR token present → pass through.

### Public Patterns (regex)
```ts
const PUBLIC_PATTERNS = [
  /^\/[a-z]{2}$/,                           // /ar  /en
  /^\/[a-z]{2}\/(auth)(\/|$)/,              // /ar/auth/...
  /^\/[a-z]{2}\/stock\/.+/,                 // /ar/stock/AAPL — soft gate at page level
  /^\/_next\//,                              // Next.js internals
  /^\/favicon/,                              // favicon
  /^\/api\//,                                // API routes (handled by FastAPI)
];
```

### Redirect format
```
/[locale]/auth/signin?returnTo=[url-encoded-pathname]
```
Example: `/ar/dashboard` → `/ar/auth/signin?returnTo=%2Far%2Fdashboard`

---

## returnTo Contract

### Passing returnTo
- Set by: middleware (hard redirect), `<SignInGateModal>` CTAs (soft gate)
- Format: URL-encoded pathname (no origin, no external domain)
- Example: `?returnTo=%2Fen%2Fstock%2FAAPL`

### Validating returnTo
After sign-in, before redirecting:
```ts
function safeReturnTo(raw: string | null, origin: string): string {
  if (!raw) return '';
  try {
    const url = new URL(decodeURIComponent(raw), origin);
    return url.origin === origin ? url.pathname + url.search : '';
  } catch {
    return '';
  }
}
```
- Returns sanitized pathname or empty string (falls back to `/[locale]/dashboard`)
- Blocks all external redirect attacks

---

## Soft Gate Contract

### Stock Detail Page (`/[locale]/stock/[ticker]`)

**Phase 1 — Teaser render** (always, for all visitors):
- Fetch basic stock data (ticker symbol, company name, Halal verdict, traffic light rating)
- Render exactly 3 teaser elements:
  1. `<TrafficLightBadge>` (pass/caution/fail)
  2. Halal verdict label (pass/fail, with mandatory disclaimer)
  3. Company name + ticker symbol
- All numeric scores, charts, news, and analysis sections are NOT rendered (not hidden — absent from DOM)

**Phase 2 — Gate trigger** (only for unauthenticated `guest` tier):
- Fires once, ≤ 300 ms after teaser data has rendered
- `<SignInGateModal>` opens with `returnTo` = current pathname
- Background: `aria-inert="true"` applied to teaser container
- Modal is non-dismissible (no Escape close, no backdrop click close)

**Phase 2 — Gate suppression** (on teaser fetch error):
- Show inline error message + "Try Again" button
- Gate MUST NOT open when teaser data failed to load

**Phase 3 — Authenticated view** (free/pro/enterprise tier):
- Teaser elements remain visible
- Full analysis sections render below, gated by `<UpgradeGate requiredTier="pro">` where applicable

---

## Authentication Flow Contract

```
[Stock Detail page]  ──guest──→  <SignInGateModal>
                                    │
                        ┌───────────┴───────────┐
                        ↓                       ↓
            "Sign Up Free"               "Sign In"
            /[locale]/auth/signup        /[locale]/auth/signin
            ?returnTo=[path]             ?returnTo=[path]
                        │                       │
                        └───────────┬───────────┘
                                    ↓
                          Backend auth (FastAPI)
                          Sets auth_token httpOnly cookie
                                    │
                                    ↓
                          Redirect to returnTo path
                          (validated by safeReturnTo)
```

---

## i18n Contract

All user-facing text MUST use `next-intl` keys. No hardcoded strings in components.

Key namespaces for this feature:

| Namespace | Contents |
|-----------|----------|
| `nav` | Site navigation labels |
| `landing` | Hero, features section, pricing CTA copy |
| `auth` | Sign In / Sign Up form labels, errors, prompts |
| `dashboard` | Greeting, service card labels |
| `gate` | `SignInGateModal` headline, value prop, CTA labels |
| `pricing` | Plan names, feature lists, CTA labels, disclaimer |
| `services` | Service card titles and descriptions |
| `upgrade` | UpgradeGate prompt copy per feature |

Language default: `ar` (Arabic). Both `ar.json` and `en.json` must contain every key.
