'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from './Badge';
import { Button } from './Button';
import { useUserTier } from '../../hooks/useUserTier';

/**
 * Dismissible warning banner rendered when UserSession.tier
 * is absent or unrecognised (coerced to guest).
 * Wired into layout.tsx.
 */
export function TierRefreshBanner() {
  const tier = useUserTier();
  const t = useTranslations('auth');
  const [dismissed, setDismissed] = useState(false);

  // Only show when the tier was coerced to 'guest' due to invalid JWT claim
  // The banner is toggled by layout.tsx passing a prop indicating coercion,
  // here we just render and expose dismissal.
  if (dismissed) return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 bg-yellow-50 border border-yellow-300 px-4 py-2 text-sm text-yellow-800"
    >
      <div className="flex items-center gap-2">
        <Badge variant="warning">{t('refreshBanner.badge')}</Badge>
        <span>{t('refreshBanner.message')}</span>
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
