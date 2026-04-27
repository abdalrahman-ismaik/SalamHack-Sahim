'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';
import type { UserTier } from '@/lib/auth';
import { useUserTier } from '@/hooks/useUserTier';
import { Card } from './Card';
import { Button } from './Button';
import { motion } from 'framer-motion';

const TIER_RANK: Record<UserTier, number> = {
  guest:      0,
  free:       1,
  pro:        2,
  enterprise: 3,
};

interface UpgradeGateProps {
  requiredTier: 'free' | 'pro' | 'enterprise';
  featureKey:   'arima' | 'risk' | 'allocator' | 'sector' | 'news' | 'live-monitoring';
  children:     ReactNode;
}

export function UpgradeGate({ requiredTier, featureKey, children }: UpgradeGateProps) {
  const t      = useTranslations('upgrade');
  const locale = useLocale();
  const tier   = useUserTier();

  const hasAccess = TIER_RANK[tier] >= TIER_RANK[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="glass" className="flex flex-col items-center text-center gap-5 py-12 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059]/5 to-[#00E676]/5 pointer-events-none" />
        
        {/* Lock icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#C5A059]/20 blur-xl rounded-full" />
          <div className="relative w-16 h-16 rounded-full bg-[#121212] border border-[#C5A059]/30 flex items-center justify-center">
            <svg className="w-7 h-7 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white relative">
          {t(`${featureKey}.title`)}
        </h3>
        <p className="text-sm text-gray-400 max-w-sm relative leading-relaxed">
          {t(`${featureKey}.description`)}
        </p>
        <a href={`/${locale}#pricing`} aria-label={t('cta')} className="relative">
          <Button variant="gold">
            {t('cta')}
          </Button>
        </a>
        <span className="sr-only">
          {`This feature requires a ${requiredTier} plan. ${t(`${featureKey}.description`)}`}
        </span>
      </Card>
    </motion.div>
  );
}
