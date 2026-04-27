'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useUserTier } from '@/hooks/useUserTier';
import { Card } from '@/components/ui/Card';
import { UpgradeGate } from '@/components/ui/UpgradeGate';
import { SERVICES } from '@/lib/services';
import type { UserTier } from '@/lib/types';

const TIER_RANK: Record<UserTier, number> = {
  guest: 0, free: 1, pro: 2, enterprise: 3,
};

export function ServiceCardGrid() {
  const t      = useTranslations('services');
  const locale = useLocale();
  const tier   = useUserTier();

  return (
    <ul
      role="list"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6"
    >
      {SERVICES.map((service) => {
        const locked = TIER_RANK[tier] < TIER_RANK[service.requiredTier as UserTier];

        const cardContent = (
          <Card
            as="article"
            className={`p-5 flex flex-col gap-2 ${!service.available ? 'opacity-60' : ''}`}
          >
            <h3 className="font-semibold text-gray-900 text-sm">
              {t(`${service.id}.title`)}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2">
              {t(`${service.id}.description`)}
            </p>
          </Card>
        );

        return (
          <li key={service.id}>
            {locked ? (
              <UpgradeGate
                requiredTier={service.requiredTier as UserTier}
                featureKey={service.id}
              >
                {cardContent}
              </UpgradeGate>
            ) : (
              <a
                href={`/${locale}${service.href}`}
                className="block rounded-xl hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {cardContent}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
