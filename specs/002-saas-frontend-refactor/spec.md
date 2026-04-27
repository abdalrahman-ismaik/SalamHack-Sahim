# Feature Specification: SaaS Frontend Refactor

**Feature Branch**: `002-saas-frontend-refactor`  
**Created**: 2026-04-27  
**Status**: Draft  

---

## Clarifications

### Session 2026-04-27

- Q: What exactly constitutes the "teaser result" shown to an unauthenticated visitor before the sign-in gate fires? → A: Traffic Light badge + Halal verdict label (Compliant / Non-Compliant) + stock name/ticker — no numeric scores.
- Q: When does the `<SignInGateModal>` open — after teaser data renders or on page load? → A: Modal opens immediately after the teaser result renders on screen (data visible first).
- Q: What happens if the teaser API call fails — should the gate still appear? → A: Show error state, do not fire the gate.
- Q: How should unauthenticated session state be represented in `UserSession`? → A: Typed guest object with `tier: "guest"` — same shape as authenticated session, `id` and `name` are null.
- Q: Should the focus trap inside `<SignInGateModal>` apply on touch/mobile devices or keyboard-only? → A: Focus trap applies on all devices and input methods (keyboard, touch, assistive tech).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Landing Page & Pricing Discovery (Priority: P1)

A first-time visitor arrives at the product homepage, immediately understands
the value proposition in their language (Arabic or English), scrolls through
features, views the three pricing plans, and clicks a call-to-action to sign up
or start for free — all without needing prior finance knowledge.

**Why this priority**: The landing page is the product's front door. Without a
compelling, accessible landing page the product cannot convert visitors into
users. It is the single most critical page for a SaaS product launch.

**Independent Test**: Navigate to `/` as an unauthenticated visitor. The page
must render a hero section, a features section, a pricing section (Free / Pro /
Enterprise), and a footer — fully in Arabic when the locale is `ar`, fully in
English when the locale is `en`. All interactive elements must be keyboard
reachable. Delivers standalone value as a marketing asset.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they load the landing page in
   Arabic locale, **Then** all text (hero headline, feature descriptions, plan
   names, CTA buttons) renders in Arabic with correct RTL layout.
2. **Given** a visitor on the pricing section, **When** they view the three
   plans, **Then** each plan card shows a plan name, price or "Contact Us",
   a feature list, and a CTA button with clear visual hierarchy.
3. **Given** a visitor using keyboard only, **When** they Tab through the page,
   **Then** every interactive element (nav links, CTA buttons, pricing CTAs,
   language switcher) receives visible focus in logical DOM order.
4. **Given** a visitor on mobile viewport (375 px), **When** the page loads,
   **Then** the pricing cards stack vertically with no horizontal overflow and
   all text remains legible.

---

### User Story 2 — Authenticated Dashboard Home (Priority: P2)

A signed-in user lands on their personalised dashboard after login. The
dashboard shows their tier badge (Free / Pro / Enterprise), quick-access cards
for each available service, and a clear visual indicator on cards that are
locked behind a higher tier — with an upgrade prompt instead of a dead link.

**Why this priority**: The dashboard is the product's persistent home for
returning users. It must immediately communicate what the user can do and what
they can unlock, turning tier limits into an upsell opportunity rather than
a frustration.

**Independent Test**: Sign in as a Free-tier user. Dashboard must render within
3 seconds, show the tier badge, display all service cards, and visually
distinguish locked cards. Clicking a locked card must show an upgrade modal —
not a 403 page.

**Acceptance Scenarios**:

1. **Given** a Free-tier user on the dashboard, **When** the page loads, **Then**
   service cards available on Free tier are fully clickable, and Pro/Enterprise
   cards show a lock icon with an "Upgrade" prompt.
2. **Given** a Free-tier user who clicks a locked card, **When** the upgrade
   modal opens, **Then** the modal names the specific benefit they are unlocking
   and links to the pricing page, with an accessible close button (Escape key
   and visible ×).
3. **Given** a Pro-tier user on the dashboard, **When** the page loads, **Then**
   no lock icons appear on Pro-tier cards; Enterprise-only cards still show the
   lock with "Enterprise" label.
4. **Given** a user on any dashboard card, **When** they navigate by keyboard,
   **Then** Tab moves between cards, Enter activates the card, and the focus
   ring is visible at all times.

---

### User Story 3 — Tier-Gated Feature Pages (Priority: P3)

When a Free user navigates directly to a URL for a Pro feature (e.g., the ARIMA
chart page or live monitoring), the page renders a preview or description of the
feature alongside an upgrade call-to-action — not a blank page or an error
screen.

**Why this priority**: Direct URL access bypasses the dashboard lock UI. The
product must degrade gracefully to an upgrade prompt at the page level, which
also acts as a secondary conversion surface.

**Independent Test**: As a Free-tier user, navigate directly to
`/[locale]/stock/[ticker]` and scroll to the ARIMA chart section. The chart
area must render an upgrade panel instead of the chart — with text describing
the benefit and a "Upgrade to Pro" button. No console errors, no 403.

**Acceptance Scenarios**:

1. **Given** a Free user on a stock detail page, **When** the ARIMA section
   renders, **Then** a `<UpgradeGate>` component replaces the chart, describing
   the feature in the active language and linking to the pricing page.
2. **Given** a Free user on the live-monitoring page, **When** the page renders,
   **Then** the full layout is visible but data areas show an upgrade prompt with
   a blurred/placeholder visual to illustrate what they are missing.
3. **Given** the upgrade prompt, **When** a screen reader focuses on it, **Then**
   the element reads: "This feature is available on the Pro plan. Activate your
   upgrade to access [feature name]." (or Arabic equivalent).

---

### User Story 5 — Soft Sign-In Gate: Try Then Wall (Priority: P2)

An unauthenticated visitor searches for a stock ticker, sees a teaser result
(Traffic Light score and basic Halal verdict), and is immediately presented
with a non-dismissible sign-in modal that says *"Sign in to continue — it's
free"* before they can take any further action. The visitor can sign up or
sign in directly from the modal without losing their context.

**Why this priority**: Letting users experience real output before asking for
registration dramatically increases sign-up conversion. The modal must appear
after value has been demonstrated, not before — so the user already wants to
continue. Making it non-dismissible ensures the gate is enforced while
avoiding a hard redirect that breaks the browsing flow.

**Independent Test**: As an unauthenticated visitor, navigate to a stock
detail page and trigger a score lookup. The teaser result (traffic light badge
only) MUST render. Immediately after, the `<SignInGateModal>` MUST appear and
remain open — Escape key and clicks outside the modal MUST NOT close it. All
content behind the modal MUST be inert (not interactive) while it is open.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor on `/[locale]/stock/[ticker]`, **When**
   the teaser score renders, **Then** the `<SignInGateModal>` opens within 300 ms
   with a headline, value proposition sentence, and two CTA buttons: "Sign Up
   Free" and "Sign In".
2. **Given** the `<SignInGateModal>` is open, **When** the visitor presses Escape
   or clicks the backdrop, **Then** the modal does NOT close — it remains fully
   blocking.
3. **Given** the `<SignInGateModal>` is open, **When** the visitor clicks
   "Sign Up Free", **Then** they are taken to `/[locale]/auth/signup` with the
   originating ticker preserved in the return URL so they land back on the stock
   page after registering.
4. **Given** the `<SignInGateModal>` is open in Arabic locale, **When** it
   renders, **Then** all text (headline, value prop, CTA labels) is in Arabic
   with correct RTL layout and the modal is keyboard-navigable (Tab cycles
   between the two CTAs only; focus does not escape to background content).
5. **Given** a visitor who has already signed in during this browser session,
   **When** they revisit any stock page, **Then** the `<SignInGateModal>` does
   NOT appear.

---

### User Story 4 — Reusable Accessible Component Library (Priority: P4)

A developer building any new page in the project uses components from
`frontend/src/components/ui/` — Button, Badge, Card, Modal, UpgradeGate,
PricingCard, TrafficLightBadge — without writing new Tailwind from scratch,
and every component works correctly with keyboard navigation and screen readers
out of the box.

**Why this priority**: Component consistency ensures every page meets
accessibility and design standards automatically. It is the foundation that
makes all other stories feasible at speed during the hackathon.

**Independent Test**: Render each component in isolation. Tab into it, activate
it with Enter/Space, dismiss any modal with Escape. Inspect ARIA attributes.
All interactions work without a mouse.

**Acceptance Scenarios**:

1. **Given** any `<Button>` variant, **When** a keyboard user presses Enter or
   Space while focused, **Then** the `onClick` handler fires and focus remains
   logical.
2. **Given** a `<Modal>` is open, **When** the user presses Escape, **Then** the
   modal closes and focus returns to the element that triggered it.
3. **Given** a `<PricingCard>` component, **When** rendered with `plan`,
   `price`, `features[]`, and `ctaLabel` props, **Then** it renders a complete
   plan card with correct ARIA roles and all text sourced from props (no
   hardcoded strings).
4. **Given** any component in the library, **When** inspected with an
   accessibility audit tool, **Then** no WCAG 2.1 AA contrast violations or
   missing ARIA labels are reported.

---

### Edge Cases

- What happens when a user's tier claim in the session token is absent or
  unrecognised? Default to Free tier and show a banner asking the user to
  refresh.
- How does the system handle very long Arabic stock names overflowing card
  boundaries? Cards MUST clamp text at 2 lines with an ellipsis.
- What if the pricing API (future Stripe integration) is unavailable? The
  pricing section MUST render from static placeholder data and show no error.
- What happens when a user resizes from desktop to mobile mid-session? Layout
  MUST reflow without page reload.
- How does RTL / LTR switching affect form validation error placement? Errors
  MUST always appear on the visually correct side of the input.
- What if a visitor uses the browser Back button after the sign-in modal
  appears? Back button navigation away from the page is allowed — the modal
  MUST NOT intercept browser history. Only same-page dismissal is blocked.
- What if a visitor opens a stock page in multiple tabs? Each tab independently
  shows the gate modal for that tab's session state — no cross-tab coordination
  is required for MVP.
- What if the teaser API call fails and no data loads? The page MUST render an
  inline error state with a "Try again" button (in the active locale). The
  `<SignInGateModal>` MUST NOT open when no teaser data has rendered — the
  gate only fires on successful teaser load.

---

## Tier & Accessibility Constraints *(SaaS — mandatory)*

- **Tier gate**:
  - **Free**: Landing page, Sign Up/In, Dashboard (with locks), Stock Search,
    Traffic-Light Score, basic Halal verdict, 3 news headlines.
  - **Pro**: ARIMA chart, full news + AI summaries, Risk dashboard (Beta/VaR/Sharpe),
    Portfolio Allocator, Sector heat map, Live Monitoring.
  - **Enterprise**: Everything in Pro + white-label layout options.
  - Tier is read from the JWT payload (`tier: "free" | "pro" | "enterprise"`).
    Client gating is cosmetic only; API enforces the real boundary.
- **Accessibility**: All interactive elements support Tab / Enter / Space /
  Escape. All dynamic regions use `aria-live="polite"`. No mouse-only paths.
  WCAG 2.1 AA contrast required for all text and interactive states.
- **Bilingual**: Every string in every new or refactored component MUST be
  sourced from `frontend/src/messages/ar.json` and `en.json` via `next-intl`.
  No hardcoded user-facing strings in component files.

---

## Requirements *(mandatory)*

### Functional Requirements

**Landing Page**

- **FR-001**: System MUST render a landing page at `/[locale]/` accessible to
  unauthenticated visitors with a hero section, features section, pricing
  section, and footer.
- **FR-002**: The pricing section MUST display three plan cards: Free ($0),
  Pro (placeholder price), and Enterprise (Contact Us), each with a feature
  list and a CTA button.
- **FR-003**: The language switcher MUST toggle between `ar` (RTL) and `en`
  (LTR) without a full page reload, updating all visible text immediately.

**Authentication & Routing**

- **FR-004**: Routes that require a full session (`/[locale]/dashboard` and all
  service pages except stock detail) MUST redirect unauthenticated users to the
  sign-in page. The stock detail page (`/[locale]/stock/[ticker]`) is exempt
  from this hard redirect — it uses the soft gate defined in FR-017.
- **FR-005**: After successful sign-in, the system MUST redirect users to
  `/[locale]/dashboard`, unless a `returnTo` URL parameter is present, in which
  case it MUST redirect to that URL instead.

**Dashboard**

- **FR-006**: The dashboard MUST render a tier badge showing the user's current
  plan (Free / Pro / Enterprise).
- **FR-007**: Service cards for tiers higher than the user's current tier MUST
  display a lock icon and open an `<UpgradeGate>` modal on activation — not
  navigate to the feature page.
- **FR-008**: The `<UpgradeGate>` modal MUST name the specific feature being
  unlocked and provide a link to the pricing page.

**Component Library**

- **FR-009**: The following components MUST exist in `frontend/src/components/ui/`
  and be reusable via props: `Button`, `Badge`, `Card`, `Modal`, `UpgradeGate`,
  `PricingCard`, `SectionHeading`, `SignInGateModal`.
- **FR-010**: Every component MUST expose no internal API calls — all data is
  passed via props.
- **FR-011**: All components MUST use Tailwind CSS exclusively (no inline
  styles, no separate CSS files beyond `globals.css`).

**Accessibility**

- **FR-012**: All interactive elements MUST be keyboard navigable and include
  visible focus indicators using Tailwind `focus-visible:ring-*` utilities.
- **FR-013**: All images and icons MUST have descriptive `alt` text or
  `aria-hidden="true"` if decorative.
- **FR-014**: Dynamic content updates (score loading, modal open/close) MUST
  use `aria-live` regions or `role="status"` to notify screen readers.

**Tier Enforcement**

- **FR-015**: Tier gating on the client MUST be driven by a single
  `useUserTier()` hook that reads the session JWT; no ad-hoc tier checks
  scattered across components.
- **FR-016**: The `<UpgradeGate>` component MUST render whenever the current
  user's tier does not meet the required tier for a feature, regardless of
  how the page is accessed (direct URL or navigation).

**Soft Sign-In Gate**

- **FR-017**: The stock detail page MUST be accessible to unauthenticated
  visitors and MUST render a teaser result consisting of exactly four
  elements: (1) the Traffic Light badge (colour indicator with label), (2)
  the Halal verdict label ("Compliant" or "Non-Compliant" in the active
  locale), (3) the stock name and ticker symbol, and (4) the mandatory
  Halal disclaimer text ("التحقق النهائي من الحلية يقع على عاتق المستخدم" in
  Arabic; English equivalent in `en` locale) — required by Constitution
  Principle IV. No numeric scores, price data, or chart previews are included
  in the teaser. All Pro-tier sections MUST remain hidden behind `<UpgradeGate>`
  after sign-in.
- **FR-018**: After the teaser result has rendered for an unauthenticated
  visitor (i.e., the Traffic Light badge, Halal verdict label, and stock
  name/ticker are all visible in the DOM), the `<SignInGateModal>` MUST open
  automatically within 300 ms. The modal MUST NOT open before the teaser data
  is present. Pressing Escape, clicking the backdrop, or any other same-page
  interaction MUST NOT close the modal. The background page content MUST be
  marked `aria-inert` while the modal is open.
- **FR-019**: The `<SignInGateModal>` MUST contain: (a) a headline in the
  active locale, (b) one sentence of value proposition, (c) a primary "Sign Up
  Free" CTA that navigates to `/[locale]/auth/signup?returnTo=[current path]`,
  and (d) a secondary "Sign In" CTA that navigates to
  `/[locale]/auth/signin?returnTo=[current path]`. No close or dismiss control
  is present. Focus MUST be trapped inside the modal on all devices and input
  methods (keyboard Tab/Shift+Tab, touch, and assistive technology such as
  VoiceOver and TalkBack) — interaction MUST cycle only between the two CTAs.

### Key Entities

- **UserSession**: Represents any visitor with `id` (null for guests), `name`
  (null for guests), `locale`, and `tier` (`"guest" | "free" | "pro" | "enterprise"`).
  Unauthenticated visitors always have a guest session object — the session is
  never `null`. The `useUserTier()` hook always returns a string, never null.
- **PricingPlan**: `id`, `name`, `price` (display string), `features[]`,
  `ctaLabel`, `ctaHref`, `highlighted` (boolean for featured plan).
- **ServiceCard**: `id`, `title`, `description`, `icon`, `href`,
  `requiredTier`, `available` (computed from user tier).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

1. A first-time visitor can navigate from the landing page hero to a completed
   sign-up in under 2 minutes.
2. All three pricing plan cards render correctly in both Arabic and English on
   screens from 375 px to 1440 px wide.
3. Every page passes a keyboard-only navigation test: a user can reach and
   activate every interactive element without a mouse.
4. Zero WCAG 2.1 AA contrast violations reported by an automated accessibility
   audit on the landing page, dashboard, and stock detail page.
5. A Free-tier user who attempts to access any Pro feature receives an upgrade
   prompt (not an error) within one interaction — whether via dashboard click
   or direct URL navigation.
6. All user-facing strings render correctly in both Arabic (RTL) and English
   (LTR); no untranslated `[MISSING_KEY]` placeholder appears in either locale.
7. The component library covers all UI patterns needed by existing pages:
   buttons, badges, cards, modals, pricing cards, tier-gate panels, section
   headings, and the sign-in gate modal — with no pattern requiring custom
   one-off Tailwind outside the library.
8. An unauthenticated visitor who triggers the soft gate and proceeds through
   sign-up lands back on the original stock page (via `returnTo`) with their
   session active, with no additional navigation step required.

---

## Assumptions *(documented defaults)*

- Authentication (JWT session management) is handled by the existing backend;
  this spec covers only the frontend rendering and routing layer.
- Stripe billing integration is out of scope for MVP; pricing plan data is
  static placeholder content served from `frontend/src/lib/pricing.ts`.
- The `useUserTier()` hook reads from the existing session context — actual
  session management implementation is not part of this spec.
- Framer Motion may be used for page transitions and modal animations but
  motion MUST be disabled when `prefers-reduced-motion` is active.
- Under the SalamHack sandbox, all users are assumed pre-KYC verified; no
  identity verification UI is required (per Sandbox Assumptions in the
  constitution).

---

## Out of Scope

- Backend API changes (tier enforcement at API layer is covered by FR-016
  in the existing spec 001).
- Stripe payment flow (checkout, webhooks, subscription management).
- "Forgot Password" and email-verification flows (per hackathon sandbox
  mocking guidelines).
- Admin or team-management pages.
