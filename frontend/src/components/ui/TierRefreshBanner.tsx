'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useUserTier } from '@/hooks/useUserTier';

/**
 * Dismissible warning banner rendered when UserSession.tier
 * is absent or unrecognised (coerced to guest).
 * Wired into layout.tsx.
 */
export function TierRefreshBanner() {
  const tier = useUserTier();
  const t = useTranslations('auth');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 bg-[#FFB300]/10 border border-[#FFB300]/20 px-4 py-3 text-sm text-[#FFB300] rounded-lg"
    >
      <div className="flex items-center gap-2">
        <Badge variant="warning">{t('refreshBanner.badge')}</Badge>
        <span className="text-gray-300">{t('refreshBanner.message')}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setDismissed(true);
          window.location.reload();
        }}
      >
        {t('refreshBanner.cta')}
      </Button>
    </div>
  );
}
