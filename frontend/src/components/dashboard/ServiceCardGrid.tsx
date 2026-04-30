'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Calculator,
  LockKeyhole,
  Newspaper,
  PieChart,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Wand2,
  type LucideIcon,
} from 'lucide-react';
import { useUserTier } from '@/hooks/useUserTier';
import { Card } from '@/components/ui/Card';
import { UpgradeOverlay } from '@/components/dashboard/UpgradeOverlay';
import { SERVICES } from '@/lib/services';
import type { UserTier } from '@/lib/types';
import { motion, MotionConfig } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/motion';

const TIER_RANK: Record<UserTier, number> = {
  guest: 0, free: 1, pro: 2, enterprise: 3,
};

const iconMap: Record<string, LucideIcon> = {
  'stock-screener': Search,
  'halal-verdict': BadgeCheck,
  'risk-wizard': Wand2,
  'arima-forecast': TrendingUp,
  'portfolio-allocator': PieChart,
  'risk-dashboard': ShieldAlert,
  'sector-explorer': BarChart3,
  'news-agent': Newspaper,
  'zakat-calculator': Calculator,
};

export function ServiceCardGrid() {
  const t = useTranslations('services');
  const tTier = useTranslations('dashboard.tier');
  const locale = useLocale();
  const tier = useUserTier();

  return (
    <MotionConfig reducedMotion="never">
    <motion.ul
      role="list"
      variants={{
        ...staggerContainer,
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6"
    >
      {SERVICES.map((service) => {
        const locked = TIER_RANK[tier] < TIER_RANK[service.requiredTier as UserTier];
        const Icon = iconMap[service.id] ?? Sparkles;

        const cardContent = (
          <Card
            as="article"
            variant="default"
            hover={!locked && service.available}
            className={`relative min-h-[188px] overflow-hidden rounded-xl p-5 ${!service.available ? 'opacity-50' : ''} ${
              locked ? 'border-[#C5A059]/10 bg-[#0E0E0E]/85' : 'border-white/10 bg-[#111]/90'
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/45 to-transparent" />
            <div className="flex h-full flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                  locked
                    ? 'border-white/10 bg-white/[0.035] text-white/35'
                    : 'border-[#C5A059]/25 bg-[#C5A059]/10 text-[#E8D4B0]'
                }`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold leading-6 text-white">
                      {t(`${service.id}.title`)}
                    </h3>
                    {locked ? (
                      <LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-[#C5A059]" aria-hidden="true" />
                    ) : (
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-white/35 transition-colors group-hover:text-[#C5A059]" aria-hidden="true" />
                    )}
                  </div>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    service.requiredTier === 'free'
                      ? 'border-white/10 bg-white/[0.03] text-white/45'
                      : 'border-[#C5A059]/25 bg-[#C5A059]/10 text-[#E8D4B0]'
                  }`}>
                    {tTier(service.requiredTier as Parameters<typeof tTier>[0])}
                  </span>
                </div>
              </div>
              <p className="line-clamp-2 text-sm leading-6 text-white/52">
                {t(`${service.id}.description`)}
              </p>
              {!service.available && (
                <span className="text-xs font-medium text-white/35">{t(`${service.id}.comingSoon` as Parameters<typeof t>[0])}</span>
              )}
              <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                <span className={locked ? 'text-[#E8D4B0]' : 'text-white/40'}>
                  {locked ? tTier('upgrade') : t(`${service.id}.title`)}
                </span>
                <ArrowUpRight className={`h-3.5 w-3.5 ${locked ? 'text-[#C5A059]' : 'text-white/35'}`} aria-hidden="true" />
              </div>
            </div>
            <UpgradeOverlay visible={locked} />
          </Card>
        );

        const href = locked
          ? `/${locale}/pricing`
          : service.available
            ? `/${locale}${service.href}`
            : '#';

        return (
          <motion.li
            suppressHydrationWarning
            key={service.id}
            variants={fadeInUp}
          >
            <Link
              href={href}
              role="button"
              tabIndex={0}
              aria-label={locked ? `${t(`${service.id}.title`)} - ${tTier('proFeature')}` : t(`${service.id}.title`)}
              className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {cardContent}
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
    </MotionConfig>
  );
}
