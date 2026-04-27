'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';
import type { UserTier } from '@/lib/auth';
import { useUserTier } from '@/hooks/useUserTier';
import { Card } from './Card';
import { Button } from './Button';

const TIER_RANK: Record<UserTier, number> = {
  guest:      0,
  free:       1,
  pro:        2,
  enterprise: 3,
};

interface UpgradeGateProps {
  requiredTier: 'free' | 'pro' | 'enterprise';
  featureKey:   'arima' | 'risk' | 'allocator' | 'sector' | 'news';
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
    <Card className="flex flex-col items-center text-center gap-4 py-10">
      <p className="text-3xl" aria-hidden="true">🔒</p>
      <h3 className="text-lg font-semibold text-gray-900">
        {t(`${featureKey}.title`)}
      </h3>
      <p className="text-sm text-gray-600 max-w-sm">
        {t(`${featureKey}.description`)}
      </p>
      <a href={`/${locale}#pricing`} aria-label={t('cta')}>
        <Button variant="default">
          {t('cta')}
        </Button>
      </a>
      <span className="sr-only">
        {`This feature requires a ${requiredTier} plan. ${t(`${featureKey}.description`)}`}
      </span>
    </Card>
  );
}
