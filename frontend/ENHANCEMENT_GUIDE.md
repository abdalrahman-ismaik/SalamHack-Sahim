# $ahim (سهم) — Enhanced Frontend Delivery

## Overview

This delivery contains a complete visual redesign of the $ahim frontend, transforming it from a plain light-theme interface into a **professional, dark-mode financial terminal** with cinematic animations, glassmorphism effects, and a cohesive gold/green accent palette.

## Design Philosophy: "Monochrome Stealth"

- **Deep void backgrounds** (`#050505`) create a premium, terminal-like atmosphere
- **Gold accents** (`#C5A059`) for CTAs, highlights, and premium elements
- **Electric green** (`#00E676`) for positive data, growth indicators, and Pro features
- **Glassmorphism** navigation with backdrop blur
- **Animated particle background** with mouse-reactive connections
- **Scroll-triggered animations** via Framer Motion
- **Stock ticker strip** in the hero for live-market feel

## What Changed

### 1. Global Styles (`app/globals.css`)
- New CSS custom properties for the dark financial theme
- Keyframe animations: shimmer, gradient-shift, float, pulse-gold, slide-up, scale-in, ticker-scroll
- Glassmorphism utility classes
- Custom scrollbar styling

### 2. UI Primitives (`components/ui/`)
| Component | Changes |
|-----------|---------|
| **Button** | Added `gold` and `glow` variants; gold gradient, atmospheric shadows, scale-on-press |
| **Badge** | Added `gold`, `pro`, `enterprise` variants; glow pulse animation for premium tiers |
| **Card** | Added `glass`, `gold`, `elevated` variants; hover lift effect with gold border glow |
| **Modal** | Dark theme with gold accent line, scale-in animation, atmospheric shadow |
| **SectionHeading** | Optional glow effect, decorative underline for center alignment |
| **PricingCard** | Gold border glow for highlighted Pro plan, checkmark icons, enhanced typography |
| **UpgradeGate** | Glass card with lock icon, gold glow, motion entrance animation |
| **SignInGateModal** | Gold-accented non-dismissible modal with staggered motion animations |
| **TierRefreshBanner** | Dark warning banner with yellow/gold accents |

### 3. Landing Page (`components/landing/`)
| Section | Changes |
|---------|---------|
| **HeroSection** | Full-screen hero with 3D chart background image, floating glow orbs, staggered motion text reveal, stats row, scroll indicator, live stock ticker strip |
| **FeaturesSection** | Grid pattern overlay, custom SVG icons for each service, hover card lift with gold accent, motion stagger entrance |
| **PricingSection** | Market topography background image, glowing SectionHeading, gold-accented Pro card with scale emphasis |
| **FooterSection** | Three-column layout, social icons, gold brand mark, bilingual disclaimer |

### 4. Navigation (`NavBar.tsx`)
- Glassmorphism sticky header with backdrop blur
- Mobile hamburger menu with AnimatePresence motion
- Gold brand mark "سهم"
- Gold CTA buttons for sign-up

### 5. Dashboard (`components/dashboard/`)
| Component | Changes |
|-----------|---------|
| **TierBadge** | Motion entrance animation; Pro/Enterprise glow pulse |
| **ServiceCardGrid** | Custom icons per service, gold lock icons for tier-locked cards, motion stagger |

### 6. Stock Detail Components
| Component | Changes |
|-----------|---------|
| **TrafficLightBadge** | SVG status icons instead of emojis, glow shadows per band, motion spring entrance |
| **HalalPanel** | Card wrapper, gold status badge icons, dark status colors |
| **NewsPanel** | Card wrapper, SVG sentiment icons, structured risk/opportunity sections |
| **RiskPanel** | Monospace data display, gold section headers, green highlight for positive metrics |
| **ArimaChart** | Dark Recharts theme (gold forecast line, green CI bounds, custom tooltip) |
| **SectorPanel** | Monospace table, gold metric headers, color-coded difference column |
| **AllocatorForm** | Gold-accented form inputs, gold result card, structured allocation table |

### 7. Auth (`components/auth/`)
| Component | Changes |
|-----------|---------|
| **SignInForm** | Dark inputs with gold focus ring, animated error banner, gold submit button |
| **SignUpForm** | Same dark styling, animated errors, gold CTA |

### 8. New Effects Components
| Component | Purpose |
|-----------|---------|
| **ParticleBackground** | Canvas-based particle system with mouse repulsion and connection lines |
| **TickerStrip** | Infinite-scrolling stock ticker with green/red price indicators |

## Generated Assets

Copy the following images to your `public/images/` folder:
- `hero-3d-charts.jpg` — 3D floating chart bars for hero background
- `market-topography.jpg` — Abstract market topology for pricing section
- `bg-titanium.jpg` — Dark titanium texture (alternative background)
- `trading-floor.jpg` — Futuristic trading floor (alternative background)

## Installation Steps

### 1. Replace CSS
```bash
cp frontend/src/app/globals.css /your-project/frontend/src/app/globals.css
```

### 2. Copy Components
```bash
# Copy all new components to your project
cp -r /mnt/agents/output/frontend/src/components/* /your-project/frontend/src/components/
```

### 3. Copy Images
```bash
cp -r /mnt/agents/output/frontend/public/images/* /your-project/frontend/public/images/
```

### 4. Update Layout
Replace your `app/[locale]/layout.tsx` to include the `ParticleBackground` and `NavBar`:

```tsx
import { getUserFromCookie } from '@/lib/auth';
import { UserProvider } from '@/providers/UserProvider';
import { ParticleBackground } from '@/components/ParticleBackground';
import { NavBar } from '@/components/NavBar';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const user = await getUserFromCookie();

  return (
    <UserProvider user={user}>
      <div className="relative min-h-screen bg-[#050505] text-white">
        <ParticleBackground />
        <NavBar />
        {children}
      </div>
    </UserProvider>
  );
}
```

### 5. Update Landing Page
Replace your `app/[locale]/page.tsx`:

```tsx
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FooterSection } from '@/components/landing/FooterSection';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FooterSection />
    </main>
  );
}
```

### 6. Update i18n Messages
Add these new keys to your `ar.json` and `en.json`:

```json
{
  "landing": {
    "hero": {
      "statUsers": "Active Users",
      "statMarkets": "Markets",
      "statUptime": "Uptime"
    }
  },
  "pricing": {
    "popular": "Popular",
    "currentPlan": "Current Plan"
  },
  "landing.footer": {
    "navLabel": "Navigation",
    "contactLabel": "Contact",
    "email": "hello@sahim.app",
    "home": "Home",
    "dashboard": "Dashboard",
    "pricing": "Pricing",
    "privacy": "Privacy",
    "terms": "Terms",
    "copyright": "© 2024 $ahim. All rights reserved.",
    "tagline": "Smart investing for Arabic-speaking beginners."
  },
  "nav": {
    "features": "Features",
    "home": "Home"
  }
}
```

## Dependencies

Ensure these are installed in your project:

```bash
npm install framer-motion focus-trap-react react-hook-form zod @hookform/resolvers
```

## Performance Notes

- **ParticleBackground** is disabled on touch devices implicitly (no mouse move)
- All Framer Motion animations respect `useReducedMotion()` for accessibility
- The ticker strip uses CSS animation (not JS) for smooth 60fps scrolling
- Images use `next/image` optimization in production

## Accessibility

- All interactive elements maintain visible focus rings (gold colored)
- `prefers-reduced-motion` is respected throughout
- ARIA labels preserved on all badges and status indicators
- Color contrast meets WCAG AA standards with the dark theme
- Modal focus trap and keyboard navigation preserved

## Troubleshooting

### "Module not found" errors
Ensure your `tsconfig.json` includes the path alias:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

### RTL Layout Issues
The dark theme uses logical properties (`start/end`, `ms/me`) which work correctly in both LTR and RTL. Ensure your `html` element has the correct `dir` attribute.

### Images not loading
Verify the images were copied to `public/images/` and restart your dev server.

## File Mapping

| New File | Replaces |
|----------|----------|
| `components/ui/Button.tsx` | Old Button |
| `components/ui/Badge.tsx` | Old Badge |
| `components/ui/Card.tsx` | Old Card |
| `components/ui/Modal.tsx` | Old Modal |
| `components/ui/SectionHeading.tsx` | Old SectionHeading |
| `components/ui/PricingCard.tsx` | Old PricingCard |
| `components/ui/UpgradeGate.tsx` | Old UpgradeGate |
| `components/ui/SignInGateModal.tsx` | Old SignInGateModal |
| `components/ui/TierRefreshBanner.tsx` | Old TierRefreshBanner |
| `components/landing/HeroSection.tsx` | Old HeroSection |
| `components/landing/FeaturesSection.tsx` | Old FeaturesSection |
| `components/landing/PricingSection.tsx` | Old PricingSection |
| `components/landing/FooterSection.tsx` | Old FooterSection |
| `components/NavBar.tsx` | Old NavBar |
| `components/dashboard/TierBadge.tsx` | Old TierBadge |
| `components/dashboard/ServiceCardGrid.tsx` | Old ServiceCardGrid |
| `components/TrafficLightBadge.tsx` | Old TrafficLightBadge |
| `components/HalalPanel.tsx` | Old HalalPanel |
| `components/NewsPanel.tsx` | Old NewsPanel |
| `components/RiskPanel.tsx` | Old RiskPanel |
| `components/ArimaChart.tsx` | Old ArimaChart |
| `components/SectorPanel.tsx` | Old SectorPanel |
| `components/AllocatorForm.tsx` | Old AllocatorForm |
| `components/LanguageSwitcher.tsx` | Old LanguageSwitcher |
| `components/DataFreshnessLabel.tsx` | Old DataFreshnessLabel |
| `components/ParticleBackground.tsx` | **NEW** |
| `components/TickerStrip.tsx` | **NEW** |
| `components/auth/SignInForm.tsx` | Old SignInForm |
| `components/auth/SignUpForm.tsx` | Old SignUpForm |
| `app/globals.css` | Old globals.css |
