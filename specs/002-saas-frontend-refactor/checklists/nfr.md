# Non-Functional Requirements Checklist: SaaS Frontend Refactor

**Purpose**: Validate quality, completeness, clarity, and measurability of all non-functional requirements in the spec before implementation begins
**Created**: 2026-04-27
**Feature**: [spec.md](../spec.md)
**Scope**: Performance, Accessibility, Security, Internationalisation, Animation/Motion, Reliability, Styling Constraints

---

## Performance Requirements

- [x] CHK001 — Is the dashboard interactive time budget (≤ 3 s on 3G) stated in the spec or plan, and is "interactive" defined with a specific metric (e.g., TTI, LCP)? [Clarity, Gap — spec states "first paint < 3s on 4G" in plan but not in spec] **MVP: plan.md states ≤3s; no further metric precision required**
- [x] CHK002 — Is the 300 ms teaser-to-gate trigger quantified as a maximum latency, or could it be misread as an exact delay? [Clarity, Spec §FR-018] **MVP: treated as "within 300ms" — acceptable**
- [x] CHK003 — Are performance budgets defined for pages other than the dashboard (landing page, stock detail, auth pages)? [Completeness, Gap] **MVP: no per-page budgets needed; plan.md global ≤3s covers this**
- [x] CHK004 — Is the "under 2 minutes" sign-up journey (Success Criterion 1) measurable from a specific start point, and is the end point (submitted form vs. session active) unambiguous? [Clarity, Spec §Success Criteria 1] **MVP: manual demo verification sufficient**
- [x] CHK005 — Are loading state requirements defined for the teaser fetch, so that a skeleton or spinner is specified rather than left to developer discretion? [Completeness, Gap] **MVP: developer discretion acceptable; skeleton preferred but not mandated**
- [x] CHK006 — Is a Lighthouse performance score threshold (≥ 80) included in the spec, or does it exist only in plan.md? [Completeness, Gap — plan.md §Technical Context only] **MVP: plan.md is sufficient authority**

---

## Accessibility Requirements

- [x] CHK007 — Does the spec define which WCAG 2.1 AA success criteria are most critical to enforce, or is "WCAG 2.1 AA" used as a blanket term without specifying failure classes (contrast, keyboard, ARIA)? [Clarity, Spec §Tier & Accessibility Constraints] **MVP: blanket WCAG 2.1 AA acceptable; focus on keyboard + contrast in demo**
- [x] CHK008 — Is the requirement for `aria-live="polite"` on all dynamic regions scoped to specific component types, or is the scope open to interpretation? [Clarity, Spec §FR-014] **MVP: apply to modals and gate state changes; exact scope left to developer**
- [x] CHK009 — Are focus indicator requirements quantified (e.g., minimum 3:1 contrast ratio, 2 px minimum offset) or stated only as "visible focus indicators using `focus-visible:ring-*`"? [Clarity, Spec §FR-012] **MVP: `focus-visible:ring-*` Tailwind classes are sufficient**
- [x] CHK010 — Is the keyboard navigation requirement (Tab / Enter / Space / Escape) consistent across all interactive elements? Does it address whether Escape should work uniformly except for `<SignInGateModal>` (which overrides it)? [Consistency, Spec §Tier & Accessibility Constraints vs FR-018] **MVP: Escape blocked only in SignInGateModal per FR-018; all other modals dismiss on Escape**
- [x] CHK011 — Are `aria-inert` semantics on the background defined for ALL modal types (`<Modal>`, `<UpgradeGate>`, `<SignInGateModal>`), or only for `<SignInGateModal>`? [Consistency, Spec §FR-018 vs FR-007/FR-009] **MVP: apply aria-inert to SignInGateModal only (highest risk); Modal/UpgradeGate use focus-trap-react**
- [x] CHK012 — Is there a requirement covering screen reader announcement when the `<SignInGateModal>` auto-opens (e.g., `role="alertdialog"` vs `role="dialog"`)? [Completeness, Gap] **MVP: use `role="alertdialog"` — auto-open warrants alert semantics**
- [x] CHK013 — Are touch and assistive technology requirements (VoiceOver, TalkBack) specified only for `<SignInGateModal>` or for all modals in the library? [Consistency, Spec §FR-019 vs FR-009] **MVP: SignInGateModal only per FR-019; other modals best-effort**
- [x] CHK014 — Is the focus-return behaviour after modal close defined for `<Modal>` and `<UpgradeGate>` (i.e., return focus to the triggering element)? [Completeness, Gap — FR-019 has no dismiss, but Modal/UpgradeGate do] **MVP: return focus to trigger on close; standard browser behaviour via focus-trap-react**
- [x] CHK015 — Does the spec define skip-link or landmark region requirements for page-level navigation accessibility? [Completeness, Gap] **MVP: skip-link out of scope; use semantic `<main>` + `<nav>` landmarks**
- [x] CHK016 — Are accessibility requirements defined for error states (form validation errors, teaser API failure inline error)? [Completeness, Gap] **MVP: `role="alert"` on inline errors; `aria-describedby` on form inputs**

---

## Security Requirements

- [x] CHK017 — Is the `returnTo` URL validation requirement stated in the spec (not just plan.md), and does it include the specific validation rules (relative-path-only, no `//`, no protocol)? [Completeness, Gap — spec references `returnTo` in FR-005/FR-019 without validation rules] **MVP: plan.md §Constraints + `safeReturnTo()` in tasks.md (T039) covers this; same-origin check is implemented**
- [x] CHK018 — Is there a spec requirement that the session cookie MUST be `HttpOnly`, `SameSite=Lax`, and `Secure`? Or is this assumed from the backend spec? [Completeness, Assumption — if not in spec 001, it is undocumented] **MVP: delegated to spec 001 backend; frontend reads cookie only, does not set it**
- [x] CHK019 — Is the "client gating is cosmetic only; API enforces the real boundary" statement strong enough as a security requirement, or does it need a testable acceptance criterion (e.g., direct API call to a Pro endpoint with a Free tier JWT MUST return 403)? [Measurability, Spec §Tier & Accessibility Constraints] **MVP: backend 403 is spec 001's concern; frontend cosmetic gating is sufficient for demo**
- [x] CHK020 — Are there requirements preventing the JWT tier claim from being cached stale in client state after a session upgrade (user upgrades from Free to Pro)? [Completeness, Gap] **MVP: TierRefreshBanner (T045) handles unknown tier; full session refresh out of scope**
- [x] CHK021 — Is the absence of Stripe secrets in the frontend codebase stated as an explicit requirement, or only implied by "Stripe out of scope"? [Clarity, Spec §Assumptions] **MVP: Stripe is fully out of scope; no secrets to protect**

---

## Internationalisation & RTL Requirements

- [x] CHK022 — Is the locale switching requirement (FR-003) explicit about what "without a full page reload" means — does it allow a Next.js route navigation, or must it be a client-side in-place update? [Clarity, Spec §FR-003] **MVP: Next.js route navigation acceptable — `next-intl` handles this natively**
- [x] CHK023 — Are RTL layout requirements (padding, margins, icon mirroring, text alignment) specified per component, or only stated as a global "use `rtl:` Tailwind variants"? [Completeness, Gap] **MVP: global `rtl:` variants sufficient; per-component detail out of scope**
- [x] CHK024 — Is the text overflow / 2-line clamp requirement for long Arabic stock names (Edge Cases) measurable — i.e., at what viewport width and what element does it apply? [Clarity, Spec §Edge Cases] **MVP: apply `line-clamp-2` to stock name elements globally; no viewport-specific rule needed**
- [x] CHK025 — Is the form validation error placement requirement ("errors MUST always appear on the visually correct side of the input") defined with a specific side rule for each locale? [Clarity, Spec §Edge Cases] **MVP: errors below input in all locales — RTL text alignment handles visual side**
- [x] CHK026 — Are all message file keys (`ar.json` / `en.json`) for new components enumerated somewhere in the spec or contracts, so that missing translation keys can be detected before implementation? [Completeness, Gap] **MVP: tasks T010/T011 enumerate all 8 namespaces; key-level enumeration deferred**
- [x] CHK027 — Is "no untranslated `[MISSING_KEY]` placeholder" (Success Criterion 6) testable with a specific method (e.g., `next-intl` strict mode, automated key coverage check)? [Measurability, Spec §Success Criteria 6] **MVP: manual demo review sufficient; `next-intl` will throw in dev mode on missing keys**

---

## Animation & Motion Requirements

- [x] CHK028 — Is the `prefers-reduced-motion` requirement applied to all animated elements, or only to page transitions and `<SignInGateModal>` entrance animation? [Completeness, Spec §Assumptions — scope unclear] **MVP: apply to all `framer-motion` variants via global `useReducedMotion()` hook; no per-element specification needed**
- [x] CHK029 — Is the motion disable behaviour specified as "remove the animation entirely" or "substitute an instant/zero-duration transition"? These produce different perceived behaviours. [Clarity, Spec §Assumptions] **MVP: use `duration: 0` (instant transition) — simpler than conditional render**
- [x] CHK030 — Are animation duration and easing values defined in the spec (or deferred to plan.md), so that the "feel" of the product is a conscious design decision rather than a developer default? [Completeness, Gap] **MVP: developer discretion; framer-motion defaults are acceptable**

---

## Styling Constraint Requirements

- [x] CHK031 — Is the "Tailwind CSS exclusively — no inline styles" requirement testable (e.g., ESLint `no-inline-styles` rule, CI check), or stated as a convention only? [Measurability, Spec §FR-011] **MVP: convention enforced by code review; no ESLint rule needed for hackathon**
- [x] CHK032 — Is the scope of `globals.css` as the sole allowed non-Tailwind CSS file defined (i.e., what is permitted in `globals.css`)? [Clarity, Spec §FR-011] **MVP: CSS custom properties and `@layer base` only; developer discretion**
- [x] CHK033 — Are dark mode requirements defined (the `dark:` Tailwind variant is referenced in plan.md Technical Context)? If dark mode is out of scope, is this stated explicitly? [Completeness, Gap] **MVP: dark mode out of scope; `dark:` variants may be added opportunistically but not required**

---

## Reliability & Error Handling Requirements

- [x] CHK034 — Is the teaser API failure inline error state (Edge Cases) specified with a required error message text structure, or only with "Try again" button presence? [Completeness, Spec §Edge Cases] **MVP: `gate.teaserError` i18n key in tasks T033a; exact text from message file — sufficient**
- [x] CHK035 — Is the "unknown/absent tier claim → default to Free + show refresh banner" edge case (Edge Cases) specified with a banner message requirement in both locales? [Completeness, Spec §Edge Cases] **MVP: `auth.refreshBanner.*` i18n key in T045 covers both locales**
- [x] CHK036 — Is the static pricing fallback (Edge Cases — pricing API unavailable) testable given that Stripe is out of scope and pricing is always static? Is this edge case still relevant? [Clarity, Spec §Edge Cases — potential dead requirement] **MVP: dead requirement — pricing is always static; no fallback needed**
- [x] CHK037 — Are retry requirements defined for any async operation (teaser fetch, tier resolution)? If retries are out of scope, is that stated? [Completeness, Gap] **MVP: no retries — single fetch attempt; show error state on failure**
- [x] CHK038 — Is the multi-tab behaviour ("no cross-tab coordination required for MVP") explicitly in scope as a deferred requirement or a permanent out-of-scope decision? [Clarity, Spec §Edge Cases] **MVP: explicitly out of scope per spec Edge Cases note**

---

## Measurability & Acceptance Criteria Quality

- [x] CHK039 — Are all Success Criteria (1–8) traceable to a specific FR number? Currently some criteria span multiple FRs or have no direct FR mapping. [Traceability, Spec §Success Criteria] **MVP: traceability matrix not required; criteria are clear enough for demo verification**
- [x] CHK040 — Is Success Criterion 3 ("every interactive element reachable and activatable via keyboard") scoped to a specific set of pages, or does it cover all pages in the feature? [Clarity, Spec §Success Criteria 3] **MVP: all pages in feature scope — landing, dashboard, stock detail, auth**
- [x] CHK041 — Is "zero WCAG 2.1 AA contrast violations reported by an automated accessibility audit" (Success Criterion 4) constrained to a specific tool (axe-core, Lighthouse, pa11y) to ensure reproducibility? [Measurability, Spec §Success Criteria 4] **MVP: axe-core via browser DevTools; no CI enforcement needed**
- [x] CHK042 — Can "no additional navigation step required" (Success Criterion 8, `returnTo` round-trip) be objectively verified — what counts as an additional step? [Measurability, Spec §Success Criteria 8] **MVP: verified manually — after sign-up, user lands on original stock page without clicking anything extra**

---

## Notes

- CHK010 is the highest-risk consistency item: the Escape-override in `<SignInGateModal>` (FR-018) conflicts with the general Escape-to-dismiss pattern in FR-009 (`<Modal>`) unless the spec explicitly carves out the exception.
- CHK017 is a security-critical gap: `returnTo` validation rules are only in plan.md, not in the spec. They should be in FR-005 or FR-019.
- CHK007/CHK041: "WCAG 2.1 AA" without a named tool creates ambiguity — different tools report different violation counts for the same page.
- CHK028/CHK029: `prefers-reduced-motion` scope and behaviour should be clarified in the spec before `framer-motion` integration begins.
- Items CHK001–CHK006 (performance) are largely deferred to plan.md; consider whether any timing budgets need to be elevated into the spec as acceptance criteria.
