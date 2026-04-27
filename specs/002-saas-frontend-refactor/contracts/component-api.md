# Contract: Component API

**Feature**: 002-saas-frontend-refactor  
**Phase**: 1 — Design  
**Status**: Complete

---

## Overview

This document defines the props interface contracts for the 8 new UI primitive components created in `frontend/src/components/ui/`. All components are:
- Props-driven with no internal API calls
- Tailwind-CSS-only styled
- WCAG 2.1 AA accessible
- Compatible with Arabic RTL (`dir="rtl"`) layouts

---

## `Button`

```ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?:    'sm' | 'md' | 'lg';
  loading?: boolean;      // shows spinner, disables click
  children: ReactNode;
}
```

Notes:
- `aria-disabled` + `aria-busy` set automatically when `loading === true`
- All variants must pass WCAG AA contrast on both light and dark backgrounds

---

## `Badge`

```ts
export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  children: ReactNode;
}
```

Notes:
- Used by `TrafficLightBadge` as its underlying primitive

---

## `Card`

```ts
export interface CardProps {
  children:  ReactNode;
  className?: string;
  as?:        'div' | 'article' | 'section';  // default 'div'
}
```

Notes:
- Semantic `as` prop allows correct landmark when used as a content region

---

## `Modal`

```ts
export interface ModalProps {
  isOpen:          boolean;
  onClose?:        () => void;   // optional — omit for non-dismissible modals
  title:           string;       // rendered in h2, used as aria-labelledby
  description?:    string;       // rendered as p, used as aria-describedby
  role?:           'dialog' | 'alertdialog';  // default 'dialog'
  initialFocusRef?: React.RefObject<HTMLElement>;
  children:        ReactNode;
}
```

Notes:
- Internally uses `focus-trap-react`
- When `onClose` is omitted: Escape key is blocked, backdrop click is blocked
- `aria-modal="true"` always applied
- `aria-inert` on all siblings applied by `focus-trap-react` config

---

## `SignInGateModal`

```ts
export interface SignInGateModalProps {
  isOpen:   boolean;
  returnTo: string;   // sanitized pathname used in CTA hrefs
}
```

Notes:
- Extends `<Modal>` internally with `role="alertdialog"` and no `onClose`
- Two CTAs (links rendered as buttons): "Sign Up Free" and "Sign In"
- CTA hrefs: `/[locale]/auth/signup?returnTo=[returnTo]` and `/[locale]/auth/signin?returnTo=[returnTo]`
- `locale` read from `useRouter()` or `useLocale()` from next-intl
- All text sourced from `gate.*` i18n namespace
- Focus trapped: cycles between the two CTA buttons only
- Background content: `aria-inert="true"` (applied to modal's parent sibling container)

---

## `UpgradeGate`

```ts
export interface UpgradeGateProps {
  requiredTier: 'pro' | 'enterprise';
  featureKey:   string;   // i18n key suffix, e.g., 'arima' → looks up 'upgrade.arima.title'
  children:     ReactNode;
}
```

Notes:
- Reads current tier from `useUserTier()` hook internally
- Renders `children` if current tier >= required tier
- Otherwise renders an upgrade prompt card with:
  - Feature name (from `upgrade.[featureKey].title`)
  - Benefit description (from `upgrade.[featureKey].description`)
  - CTA button → `/[locale]#pricing` (landing page pricing section anchor; no separate `/pricing` route exists)
- Does NOT redirect — upgrade is opt-in

---

## `PricingCard`

```ts
export interface PricingCardProps {
  planId:     PlanId;           // 'free' | 'pro' | 'enterprise'
  currentPlanId?: PlanId;       // highlighted differently for current plan
}
```

Notes:
- All display text sourced from `pricing.[planId].*` i18n namespace
- `highlighted === true` (from `PRICING_PLANS`) applies ring/shadow emphasis
- Static CTA links: 'free' → `/[locale]/auth/signup`, 'pro' → `/[locale]/auth/signup?plan=pro`, 'enterprise' → `/[locale]/contact`

---

## `SectionHeading`

```ts
export interface SectionHeadingProps {
  level?:       2 | 3 | 4;       // renders h2/h3/h4, default h2
  size?:        'lg' | 'md' | 'sm';
  align?:       'start' | 'center';
  label:        string;          // text content (already translated by parent)
  description?: string;          // optional subtitle
}
```

Notes:
- Does not call `useTranslations()` internally — parent passes translated string
- `text-start` maps to `text-right` in RTL layouts automatically via `tailwindcss-rtl`

---

## `TrafficLightBadge` (existing — prop contract formalized)

```ts
export interface TrafficLightBadgeProps {
  rating:  'green' | 'yellow' | 'red';
  size?:   'sm' | 'md' | 'lg';
  label?:  string;   // sr-only text for screen readers (i18n key resolved by parent)
}
```

Notes:
- Color semantic values: `green` = pass/strong, `yellow` = caution/moderate, `red` = fail/weak
- `label` is required for WCAG; parent must pass a translated string
