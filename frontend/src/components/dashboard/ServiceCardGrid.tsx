'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useUserTier } from '@/hooks/useUserTier';
import { Card } from '@/components/ui/Card';
import { UpgradeGate } from '@/components/ui/UpgradeGate';
import { SERVICES } from '@/lib/services';
import type { UserTier } from '@/lib/types';
import { motion, MotionConfig } from 'framer-motion';

const TIER_RANK: Record<UserTier, number> = {
  guest: 0, free: 1, pro: 2, enterprise: 3,
};

const iconMap: Record<string, React.ReactNode> = {
  'stock-screener': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
  ),
  'halal-verdict': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  'news-agent': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
  ),
  'arima-forecast': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
  ),
  'portfolio-allocator': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  'sector-explorer': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  ),
  'risk-dashboard': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  ),
  'live-monitoring': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
  ),
};

export function ServiceCardGrid() {
  const t      = useTranslations('services');
  const locale = useLocale();
  const tier   = useUserTier();
  const featureKeyMap: Record<string, 'arima' | 'risk' | 'allocator' | 'sector' | 'news' | 'live-monitoring'> = {
    'arima-forecast':      'arima',
    'risk-dashboard':      'risk',
    'portfolio-allocator': 'allocator',
    'sector-explorer':     'sector',
    'news-agent':          'news',
    'live-monitoring':     'live-monitoring',
  };

  return (
    <MotionConfig reducedMotion="never">
    <ul
      role="list"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6"
    >
      {SERVICES.map((service, index) => {
        const locked = TIER_RANK[tier] < TIER_RANK[service.requiredTier as UserTier];

        const cardContent = (
          <Card
            as="article"
            variant="default"
            hover={!locked && service.available}
            className={`p-5 flex flex-col gap-3 ${!service.available ? 'opacity-50' : ''} ${locked ? 'border-[#C5A059]/10' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${locked ? 'bg-white/5 text-gray-600' : 'bg-[#C5A059]/10 text-[#C5A059]'}`}>
                {iconMap[service.id]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm truncate">
                  {t(`${service.id}.title`)}
                </h3>
              </div>
              {locked && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {t(`${service.id}.description`)}
            </p>
            {!service.available && (
              <span className="text-xs text-gray-600 font-medium">{t(`${service.id}.comingSoon` as Parameters<typeof t>[0])}</span>
            )}
          </Card>
        );

        return (
          <motion.li
            suppressHydrationWarning
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
          >
            {locked ? (
              <UpgradeGate
                requiredTier={service.requiredTier as 'free' | 'pro' | 'enterprise'}
                featureKey={featureKeyMap[service.id] ?? 'arima'}
              >
                {cardContent}
              </UpgradeGate>
            ) : (
              <a
                href={service.available ? `/${locale}${service.href}` : '#'}
                className="block rounded-xl focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-shadow"
              >
                {cardContent}
              </a>
            )}
          </motion.li>
        );
      })}
    </ul>
    </MotionConfig>
  );
}
