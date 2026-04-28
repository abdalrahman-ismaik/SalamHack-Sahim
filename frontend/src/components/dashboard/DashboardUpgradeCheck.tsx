'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { popPostSignInFlag, getStoredTier } from '@/lib/firebase-session';
import { UpgradeModal } from '@/components/UpgradeModal';

/**
 * Renders nothing until after the first render.
 * On mount, checks if the user just signed in as a free-tier user
 * and shows the upgrade modal exactly once per sign-in event.
 */
export function DashboardUpgradeCheck() {
  const [showModal, setShowModal] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    const justSignedIn = popPostSignInFlag();
    const tier = getStoredTier();
    if (justSignedIn && tier === 'free') {
      setShowModal(true);
    }
  }, []);

  if (!showModal) return null;

  return <UpgradeModal onClose={() => setShowModal(false)} locale={locale} />;
}
