'use client';

import { ReactNode, useContext, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  BadgeCheck,
  BarChart3,
  Calculator,
  ChevronRight,
  Home,
  Info,
  LogOut,
  PieChart,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserRound,
  Wand2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { SERVICES } from '@/lib/services';
import { GradientText } from '@/components/ui/GradientText';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TierBadge } from '@/components/dashboard/TierBadge';
import { DashboardNotificationCenter } from '@/components/dashboard/DashboardNotificationCenter';
import { UserContext } from '@/providers/UserContext';
import { signOutAndRedirect } from '@/lib/firebase-session';

interface DashboardShellProps {
  children: ReactNode;
  selectedTicker: string;
}

const iconMap: Record<string, LucideIcon> = {
  'stock-screener': Search,
  'halal-verdict': BadgeCheck,
  'risk-wizard': Wand2,
  'arima-forecast': TrendingUp,
  'portfolio-allocator': PieChart,
  'risk-dashboard': ShieldAlert,
  'sector-explorer': BarChart3,
  'news-agent': Sparkles,
  'zakat-calculator': Calculator,
};

const GUIDE_STEPS = ['start', 'search', 'services', 'insights', 'support'] as const;

export function DashboardShell({ children, selectedTicker }: DashboardShellProps) {
  const locale = useLocale();
  const navT = useTranslations('dashboard.nav');
  const searchT = useTranslations('dashboard.search');
  const guideT = useTranslations('dashboard.guide');
  const servicesT = useTranslations('services');
  const session = useContext(UserContext);
  const [query, setQuery] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const isRTL = locale === 'ar';
  const displayName = session.name || navT('defaultUser');
  const profilePhoto = session.photoURL;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'S';

  const navigation = useMemo(() => {
    const serviceLinks = SERVICES.map(service => {
      const Icon = iconMap[service.id] ?? Sparkles;
      return {
        id: service.id,
        label: servicesT(`${service.id}.title`),
        description: servicesT(`${service.id}.description`),
        href: `/${locale}${service.href}`,
        Icon,
      };
    });

    return [
      {
        id: 'home',
        label: navT('home'),
        description: navT('homeDescription'),
        href: `/${locale}/dashboard`,
        Icon: Home,
      },
      ...serviceLinks,
    ];
  }, [locale, navT, servicesT]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return navigation.slice(0, 5);
    return navigation
      .filter(item => (
        item.label.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized) ||
        item.id.toLowerCase().includes(normalized)
      ))
      .slice(0, 7);
  }, [navigation, query]);

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`relative min-h-screen overflow-hidden bg-[#050505] text-white ${
        isRTL ? 'font-[var(--font-arabic)] text-right' : 'font-[var(--font-latin)] text-left'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(197,160,89,0.12),transparent_30rem),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_100%,80px_80px,80px_80px]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1680px] gap-0 p-2 md:p-3">
        <aside className="sticky top-2 hidden h-[calc(100vh-1rem)] w-[286px] shrink-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] rounded-[30px] border border-white/10 bg-[#0D0D0D]/94 p-3 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl lg:grid">
          <Link href={`/${locale}/dashboard`} className="mb-3 flex items-center rounded-2xl px-2 py-2">
            <GradientText
              className="text-2xl font-extrabold tracking-normal"
              colors={['#C5A059', '#F0D590', '#ffffff', '#F0D590', '#C5A059']}
              animationSpeed={6}
            >
              <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'سهم' : '$ahim'}</span>
            </GradientText>
          </Link>

          <div className="mb-3 rounded-3xl border border-white/10 bg-white/[0.045] p-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#C5A059]/25 bg-[#C5A059]/15 text-sm font-bold text-[#E8D4B0]">
                <UserRound className="absolute h-8 w-8 text-[#C5A059]/18" aria-hidden="true" />
                <span className="relative">{initials}</span>
                {profilePhoto && (
                  <img
                    src={profilePhoto}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="mt-0.5 text-xs text-white/45">{navT('welcome')}</p>
              </div>
            </div>
          </div>

          <nav aria-label={navT('label')} className="min-h-0 overflow-y-auto pe-1">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const active = item.id === 'home';
                const Icon = item.Icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                        active
                          ? 'border-[#C5A059]/35 bg-[#C5A059]/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                          : 'border-transparent text-white/58 hover:border-white/10 hover:bg-white/[0.055] hover:text-white'
                      }`}
                    >
                      {active && <span className="absolute inset-y-2 start-0 w-1 rounded-e-full bg-[#C5A059]" />}
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                        active
                          ? 'border-[#C5A059]/35 bg-[#C5A059]/18 text-[#E8D4B0]'
                          : 'border-white/8 bg-white/[0.035] text-white/38 group-hover:text-[#E8D4B0]'
                      }`}>
                        <Icon className="h-[16px] w-[16px]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {active && <ChevronRight className="h-4 w-4 text-[#E8D4B0]/70 rtl:rotate-180" aria-hidden="true" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-3 rounded-3xl border border-white/10 bg-[#070707]/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <button
              type="button"
              onClick={() => signOutAndRedirect(locale)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-2.5 text-sm font-semibold text-red-100 transition-colors hover:border-red-300/30 hover:bg-red-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {navT('signOut')}
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 overflow-hidden rounded-[32px] border border-white/10 bg-[#101010] text-white shadow-[0_35px_110px_rgba(0,0,0,0.32)] lg:ms-3">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#101010]/90 px-4 py-4 backdrop-blur-xl md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center justify-between gap-3 lg:hidden">
                <Link href={`/${locale}/dashboard`} className="flex items-center gap-3">
                  <GradientText
                    className="text-2xl font-extrabold tracking-normal"
                    colors={['#C5A059', '#F0D590', '#ffffff', '#F0D590', '#C5A059']}
                    animationSpeed={6}
                  >
                    <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'سهم' : '$ahim'}</span>
                  </GradientText>
                </Link>
                <TierBadge />
              </div>

              <div className="relative w-full max-w-2xl">
                <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchT('placeholder')}
                  className="h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.055] pe-4 ps-12 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#C5A059]/45 focus:bg-white/[0.08]"
                  aria-label={searchT('label')}
                />
                {query.trim() && (
                <div className="absolute start-0 top-16 z-40 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#151515]/95 shadow-[0_22px_70px_rgba(0,0,0,0.46)] backdrop-blur-xl">
                    {results.length > 0 ? (
                      results.map(item => {
                        const Icon = item.Icon;
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => setQuery('')}
                            className="flex items-center gap-3 border-b border-white/10 px-4 py-3 transition-colors last:border-b-0 hover:bg-white/[0.055]"
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C5A059]/20 bg-[#C5A059]/10 text-[#E8D4B0]">
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-white">{item.label}</span>
                              <span className="line-clamp-1 text-xs text-white/42">{item.description}</span>
                            </span>
                          </Link>
                        );
                      })
                    ) : (
                      <p className="px-4 py-5 text-sm text-white/48">{searchT('empty')}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 xl:justify-end">
                <div className="hidden rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-xs text-white/55 md:block">
                  <span className="text-white/35">{navT('selectedTicker')}</span>{' '}
                  <span className="font-semibold text-[#E8D4B0]">{selectedTicker}</span>
                </div>
                <div className="hidden lg:block">
                  <TierBadge />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGuideStep(0);
                    setGuideOpen(true);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-white/70 transition-colors hover:border-[#C5A059]/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                  aria-label={guideT('open')}
                >
                  <Info className="h-5 w-5" aria-hidden="true" />
                </button>
                <LanguageSwitcher />
                <DashboardNotificationCenter />
              </div>
            </div>

            <nav aria-label={navT('label')} className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.slice(0, 7).map(item => {
                const active = item.id === 'home';
                const Icon = item.Icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
                      active
                        ? 'border-[#C5A059]/35 bg-[#C5A059]/15 text-[#E8D4B0]'
                        : 'border-white/10 bg-white/[0.045] text-white/55'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          {children}
        </section>
      </div>

      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <section className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#101010] shadow-[0_32px_110px_rgba(0,0,0,0.62)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#C5A059]">{guideT('eyebrow')}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{guideT('title')}</h2>
                <p className="mt-2 text-sm leading-6 text-white/52">{guideT('subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="rounded-xl p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                aria-label={guideT('close')}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-[180px_1fr]">
              <div className="space-y-2">
                {GUIDE_STEPS.map((step, index) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setGuideStep(index)}
                    className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-start text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                      guideStep === index
                        ? 'border-[#C5A059]/35 bg-[#C5A059]/15 text-[#E8D4B0]'
                        : 'border-white/10 bg-white/[0.035] text-white/55 hover:bg-white/[0.055]'
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                      {index + 1}
                    </span>
                    {guideT(`steps.${step}.label`)}
                  </button>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-semibold text-[#C5A059]">
                  {guideT('stepCount', { current: guideStep + 1, total: GUIDE_STEPS.length })}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {guideT(`steps.${GUIDE_STEPS[guideStep]}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  {guideT(`steps.${GUIDE_STEPS[guideStep]}.body`)}
                </p>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setGuideStep(step => Math.max(0, step - 1))}
                    disabled={guideStep === 0}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {guideT('previous')}
                  </button>
                  {guideStep === GUIDE_STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setGuideOpen(false)}
                      className="rounded-full bg-[#C5A059] px-5 py-2 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
                    >
                      {guideT('finish')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setGuideStep(step => Math.min(GUIDE_STEPS.length - 1, step + 1))}
                      className="rounded-full bg-[#C5A059] px-5 py-2 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
                    >
                      {guideT('next')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
