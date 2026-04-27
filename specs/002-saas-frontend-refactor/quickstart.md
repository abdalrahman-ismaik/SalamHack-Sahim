# Developer Quickstart: SaaS Frontend Refactor

**Feature**: 002-saas-frontend-refactor  
**Last updated**: 2026-04-27

---

## Prerequisites

- Node.js 20 LTS
- npm 10+
- The backend FastAPI server running (see `backend/pyproject.toml`)
- `.env.local` file in `frontend/` (copy from `.env.example`)

---

## 1. Install New Dependencies

```bash
cd frontend
npm install focus-trap-react framer-motion
```

This adds the two new packages documented in [research.md](research.md):
- `focus-trap-react` — WCAG 2.1 AA focus trap for `<SignInGateModal>`
- `framer-motion` — page transitions and micro-animations

---

## 2. Environment Variables

Create `frontend/.env.local`:

```env
# Backend API URL (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Cookie name for JWT token (must match backend config)
NEXT_PUBLIC_AUTH_COOKIE_NAME=auth_token
```

The backend must issue the JWT cookie with these attributes:
- `HttpOnly; SameSite=Lax; Path=/`
- `Secure` in production (omit for local HTTP dev)
- Payload: `{ sub, name, tier, locale, exp }`

---

## 3. Start Development Server

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000 — redirects to `http://localhost:3000/ar` (Arabic default).

---

## 4. New File Checklist

Create these files in order (dependencies flow top to bottom):

### Tier 1 — Types & Static Data
- [ ] `frontend/src/lib/auth.ts` — `UserSession`, `UserTier`, `GUEST_SESSION`, `getUserFromCookie()`
- [ ] `frontend/src/lib/pricing.ts` — `PRICING_PLANS`, `PlanId`
- [ ] `frontend/src/lib/services.ts` — `ServiceCard[]` static list

### Tier 2 — Hooks & Providers
- [ ] `frontend/src/hooks/useUserTier.ts` — reads `UserContext`, returns `UserTier`
- [ ] `frontend/src/hooks/useSoftGate.ts` — fires gate once after teaser renders
- [ ] `frontend/src/providers/UserProvider.tsx` — RSC that decodes cookie + populates context

### Tier 3 — UI Primitives (`components/ui/`)
- [ ] `Button.tsx`
- [ ] `Badge.tsx`
- [ ] `Card.tsx`
- [ ] `Modal.tsx` — uses `focus-trap-react`
- [ ] `SectionHeading.tsx`
- [ ] `PricingCard.tsx` — uses `PRICING_PLANS`
- [ ] `UpgradeGate.tsx` — uses `useUserTier()`
- [ ] `SignInGateModal.tsx` — uses `Modal.tsx`, non-dismissible

### Tier 4 — i18n Extensions
- [ ] Extend `frontend/src/messages/ar.json` — add `nav`, `landing`, `auth`, `dashboard`, `gate`, `pricing`, `services`, `upgrade` namespaces
- [ ] Extend `frontend/src/messages/en.json` — same namespaces

### Tier 5 — Middleware Update
- [ ] `frontend/src/middleware.ts` — add auth guard + returnTo logic

### Tier 6 — Pages
- [ ] `frontend/src/app/[locale]/page.tsx` — Landing Page
- [ ] `frontend/src/app/[locale]/auth/signin/page.tsx` — Sign In
- [ ] `frontend/src/app/[locale]/auth/signup/page.tsx` — Sign Up
- [ ] `frontend/src/app/[locale]/dashboard/page.tsx` — Dashboard
- [ ] Update `frontend/src/app/[locale]/stock/[ticker]/page.tsx` — add soft gate

### Tier 7 — Layout Update
- [ ] Update `frontend/src/app/[locale]/layout.tsx` — add `<UserProvider>`, navigation shell

---

## 5. Key Patterns

### Reading user tier in a Server Component

```ts
import { getUserFromCookie } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getUserFromCookie() ?? GUEST_SESSION;
  return <Dashboard user={user} />;
}
```

### Reading user tier in a Client Component

```ts
'use client';
import { useUserTier } from '@/hooks/useUserTier';

export function MyComponent() {
  const tier = useUserTier(); // 'guest' | 'free' | 'pro' | 'enterprise'
  // ...
}
```

### Wrapping Pro content with UpgradeGate

```tsx
<UpgradeGate requiredTier="pro" featureKey="arima">
  <ArimaChart ticker={ticker} />
</UpgradeGate>
```

### Soft gate on Stock Detail page

```tsx
const teaserData = useTeaserData(ticker); // custom hook fetching basic stock info
const gateOpen = useSoftGate(
  !!teaserData && tier === 'guest'
);

return (
  <>
    {teaserData && <TeaserSection data={teaserData} />}
    {teaserData === null && <TeaserError />}
    <SignInGateModal isOpen={gateOpen} returnTo={pathname} />
  </>
);
```

### Adding a new i18n key

1. Add the key to both `ar.json` and `en.json` — do this in one commit
2. Reference in a component:
   ```ts
   const t = useTranslations('landing');
   return <h1>{t('hero.title')}</h1>;
   ```
3. TypeScript autocomplete for key names requires `next-intl` type generation (optional for hackathon)

---

## 6. Running Tests

```bash
cd frontend
npm test
```

No new test files are required for the hackathon MVP, but the existing test runner is configured. If time permits, add tests for:
- `safeReturnTo()` helper (pure function, easy to unit test)
- `useSoftGate()` hook (fire once guarantee)

---

## 7. Deployment

**Netlify** handles automatic deploys from the `main` branch.

Environment variables to set in Netlify dashboard:
- `NEXT_PUBLIC_API_URL` → Render.com backend URL
- `NEXT_PUBLIC_AUTH_COOKIE_NAME` → `auth_token`

The frontend communicates with the backend only via the browser — no server-to-server calls needed for MVP.

---

## 8. RTL / Accessibility Checklist Before Commit

- [ ] All new text renders correctly in Arabic RTL (test with locale toggle)
- [ ] All interactive elements reachable and operable with keyboard only
- [ ] `<SignInGateModal>` focus is trapped (test with Tab key)
- [ ] `<UpgradeGate>` renders upgrade prompt (not children) for `free` tier on Pro content
- [ ] No inline styles — Tailwind classes only
- [ ] `dark:` variants applied where colors are specified
- [ ] Framer Motion animations disabled when OS has `prefers-reduced-motion`
