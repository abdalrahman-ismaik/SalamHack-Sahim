# Research: SaaS Frontend Refactor

**Feature**: 002-saas-frontend-refactor  
**Phase**: 0 — Pre-design knowledge consolidation  
**Status**: Complete

---

## R-001: Focus Trap for Non-Dismissible Modal

**Decision**: Install **`focus-trap-react`** (~4 KB minified) as the focus-trap implementation.

**Rationale**: `focus-trap-react` is the de-facto WCAG 2.1 AA compliant solution for circular focus cycling. Manual implementations have known edge cases with dynamic content, shadow DOM, and iOS VoiceOver that cannot reliably be resolved in a hackathon timeframe.

**Alternatives considered**:
- `react-focus-lock` — heavier (~9 KB), overkill for a single modal use case
- Radix UI Dialog — default implementation allows Escape-to-dismiss; disabling this requires non-obvious config that risks regressing a11y
- Manual tabIndex cycling — error-prone; fails on iOS assistive touch without extra handling

**Key implementation notes**:
- Set `initialFocus` on the first CTA button (not the modal root) to avoid VoiceOver reading the entire modal on activation
- Pair with `aria-modal="true"` + `role="alertdialog"` on the modal container
- Apply `aria-inert="true"` on sibling DOM nodes (the teaser section) to prevent background interaction
- `aria-inert` has full support in Chrome 102+, Safari 15.5+, Firefox 112+ — no polyfill needed for the target browsers (iOS 15+, Chrome 110+)
- The modal must NOT have a dismiss control (`onDeactivate` prop should be a no-op)

---

## R-002: JWT Session Management (No NextAuth)

**Decision**: Store JWT in an **httpOnly cookie** (set by the backend on successful sign-in via `Set-Cookie` header). Read the tier claim in React Server Components using `cookies()` from `next/headers`. Expose tier to Client Components via a lightweight `UserProvider` (RSC) that populates a React context, consumed by a `useUserTier()` hook.

**Rationale**: httpOnly cookies prevent XSS token theft. The RSC + context pattern avoids prop-drilling tier data through the entire component tree while keeping client bundles clean of auth library overhead. JWT decode on the client is intentionally shallow (base64 decode, no signature verification) since tier gating is cosmetic only — the backend enforces real access control.

**Alternatives considered**:
- `localStorage` — XSS-vulnerable, rejected per Principle VII
- NextAuth / Auth.js — full auth library, ~25 KB overhead, significantly more complex than needed
- Raw cookie in Client Component — exposes token value to JavaScript

**Key implementation notes**:
```ts
// lib/auth.ts (Server-side only — NOT imported by Client Components)
import { cookies } from 'next/headers';

export async function getUserFromCookie() {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString()
    );
    return {
      id: payload.sub ?? null,
      name: payload.name ?? null,
      tier: payload.tier ?? 'guest',
      locale: payload.locale ?? 'ar',
    };
  } catch {
    return null;
  }
}
```
- Backend MUST set `SameSite=Lax; Secure; HttpOnly` attributes on the cookie
- For local development over HTTP, `Secure` can be omitted; use env flag
- Never store the raw JWT value in React state or Context — only the decoded tier/name claims

---

## R-003: returnTo Redirect Security

**Decision**: Pass `returnTo` as a **URL-encoded plain path** (not base64) in the sign-in query string. Validate by parsing with `new URL(path, request.nextUrl.origin)` and confirming `origin === request.nextUrl.origin` (same-origin check). Reject and fall back to `/[locale]/dashboard` if the check fails.

**Rationale**: Same-origin URL validation in middleware is the canonical open-redirect prevention pattern for Next.js. Base64 encoding adds no real security while making the URL less debuggable. The origin check alone reliably blocks all external redirect attacks.

**Alternatives considered**:
- Path prefix whitelist — too brittle; breaks for dynamic routes like `/en/stock/AAPL`
- Base64 encoding — cosmetic obscurity, not security; still requires origin validation
- Omitting returnTo — poor UX; user lands on dashboard instead of the stock page they were viewing

**Key implementation notes**:
```ts
// middleware.ts — sanitize helper
function safeReturnTo(raw: string | null, origin: string): string {
  if (!raw) return '';
  try {
    const url = new URL(raw, origin);
    return url.origin === origin ? url.pathname + url.search : '';
  } catch {
    return '';
  }
}
```
- `returnTo` is passed as `?returnTo=/en/stock/AAPL` on links to sign-in/sign-up
- After successful authentication, the backend redirects to `/[locale]/auth/callback?returnTo=...`
- The Next.js callback handler (or middleware) calls `safeReturnTo()` before issuing the redirect
- FR-019 CTAs in `SignInGateModal` must encode `returnTo` as the current `pathname`

---

## R-004: Soft Gate — Modal Trigger Timing

**Decision**: Use a **`useEffect` with a `setTimeout(fn, 0)` flush** after data arrives. The gate fires once, on first render of the teaser section, via a boolean guard (`hasTriggered` ref).

**Rationale**: `useEffect(() => ..., [data])` runs after paint, which is sufficient — the teaser is synchronously rendered in the same cycle that sets `data`. A `setTimeout(0)` pushes the modal-open flag to the next macrotask, ensuring the teaser is visible in the DOM and painted before the modal appears. This is simpler and more reliable than `useLayoutEffect` or a MutationObserver for this specific case.

**Alternatives considered**:
- `useLayoutEffect` — fires before paint; could cause flash-of-empty on slow devices
- `MutationObserver` — overkill; fires too broadly; performance cost
- `onLoad` callback from the data-fetching hook — tightly couples UI to fetch logic

**Key implementation notes**:
```ts
// hooks/useSoftGate.ts
export function useSoftGate(shouldFire: boolean) {
  const [gateOpen, setGateOpen] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (shouldFire && !fired.current) {
      fired.current = true;
      const id = setTimeout(() => setGateOpen(true), 0);
      return () => clearTimeout(id);
    }
  }, [shouldFire]);

  return gateOpen;
}
```
- `shouldFire` is `!!teaserData && !isAuthenticated`
- If `teaserData` fetch fails, `shouldFire` remains false → gate does NOT open (per FR-018 edge case)
- `gateOpen` has no setter exposed to consumers — the modal is intentionally non-dismissible

---

## R-005: Pricing Static Data Structure

**Decision**: Typed TypeScript constant array `PRICING_PLANS` in `frontend/src/lib/pricing.ts`. UI strings (plan names, feature lists, CTAs) live exclusively in `ar.json` / `en.json` as `pricing.*` keys. The `PricingCard` component receives a `planId` prop and uses `useTranslations('pricing')` to render.

**Rationale**: Keeps the type-safe identifier in TS (good for `tier` comparisons in `UpgradeGate`) while keeping all user-facing text translatable. Single source of truth for plan structure.

**Alternatives considered**:
- JSON file for full plan objects — loses TypeScript `as const` inference; mixing structure and strings
- Inline in component — not bilingual, not reusable

**Key implementation notes**:
```ts
// lib/pricing.ts
export const PRICING_PLANS = [
  {
    id: 'free'       as const,
    tier: 0,
    monthlyPrice: 0,
    highlighted: false,
    ctaVariant:  'outline' as const,
  },
  {
    id: 'pro'        as const,
    tier: 1,
    monthlyPrice: null,   // TBD — show "placeholder"
    highlighted: true,
    ctaVariant:  'default' as const,
  },
  {
    id: 'enterprise' as const,
    tier: 2,
    monthlyPrice: null,   // Contact us
    highlighted: false,
    ctaVariant:  'outline' as const,
  },
] as const;

export type PlanId   = typeof PRICING_PLANS[number]['id'];
export type UserTier = 'guest' | 'free' | 'pro' | 'enterprise';
```
- Features list per plan is in `en.json` / `ar.json` as `pricing.free.features`, etc. (array of strings)
- `UpgradeGate` compares `UserTier` (string union) against `PlanId` to decide whether to render or block

---

## R-006: Framer Motion + prefers-reduced-motion

**Decision**: Wrap all `motion.*` animations with `useReducedMotion()` hook from Framer Motion. When `prefersReducedMotion === true`, pass `{ initial: false, animate: false, exit: false }` to disable transitions.

**Rationale**: Framer Motion exposes `useReducedMotion()` natively; no polyfill or media query needed. This is the recommended pattern in the Framer Motion docs and satisfies WCAG 2.1 SC 2.3.3 (Animation from Interactions).

**Key implementation notes**:
```ts
const prefersReducedMotion = useReducedMotion();

const variants = prefersReducedMotion
  ? {}
  : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };
```
- Framer Motion is NOT currently installed; will be added via `npm install framer-motion` as part of the feature task
- Reduced-motion check MUST be applied to all `<motion.*>` elements, not just page-level transitions

---

## R-007: Next.js 14 Middleware Auth Guard

**Decision**: Extend the existing `intlMiddleware` wrapper in `middleware.ts` to run an auth check after locale processing. Public routes (landing, auth, and `/[locale]/stock/[ticker]`) skip the guard. All other routes redirect unauthenticated visitors to `/[locale]/auth/signin?returnTo=[path]`.

**Key implementation notes**:
```ts
// middleware.ts
const PUBLIC_PATTERNS = [
  /^\/[a-z]{2}$/,                          // landing /en or /ar
  /^\/[a-z]{2}\/(auth|_next|favicon)/,     // auth + Next.js internals
  /^\/[a-z]{2}\/stock\/.+/,               // stock detail — soft gate, not hard redirect
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATTERNS.some(p => p.test(pathname));
  const token = request.cookies.get('auth_token')?.value;

  if (!isPublic && !token) {
    const returnTo = encodeURIComponent(pathname);
    const locale = pathname.split('/')[1] ?? 'ar';
    return NextResponse.redirect(
      new URL(`/${locale}/auth/signin?returnTo=${returnTo}`, request.url)
    );
  }

  return intlMiddleware(request);
}
```
- Middleware MUST NOT decode/verify the JWT — it only checks for the cookie's presence. Verification is the backend's job.
- The `returnTo` parameter is URL-encoded pathname (no origin, no external URLs possible).

---

## Summary of New Dependencies

| Package | Version | Justification |
|---------|---------|---------------|
| `focus-trap-react` | `^10.x` | WCAG 2.1 AA focus trap in `SignInGateModal` |
| `framer-motion` | `^11.x` | Page transitions + micro-animations (Principle IX) |

All other capabilities are met by existing packages (`next-intl`, `@radix-ui/*`, Tailwind).
