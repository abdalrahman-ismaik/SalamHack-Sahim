'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { ComplianceAlertPreference, ComplianceChangeNotification, HalalStatus } from '@/lib/types';
import { getHalal } from '@/lib/api';
import { ComplianceNotificationBanner } from '@/components/ComplianceNotificationBanner';

export function DashboardAlertsBanner() {
  const [notifications, setNotifications] = useState<ComplianceChangeNotification[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    (async () => {
      try {
        const snap = await getDocs(collection(db, `users/${user.uid}/alert_preferences`));
        const checks = snap.docs
          .filter(d => (d.data() as ComplianceAlertPreference).enabled)
          .map(async d => {
            const ticker = d.id;
            const pref   = d.data() as ComplianceAlertPreference;
            if (!pref.last_known_status) return;
            try {
              const verdict = await getHalal(ticker);
              if (verdict.status !== pref.last_known_status) {
                return {
                  ticker,
                  previous_status: pref.last_known_status as HalalStatus,
                  current_status:  verdict.status as HalalStatus,
                  detected_at:     new Date().toISOString(),
                } satisfies ComplianceChangeNotification;
              }
            } catch { /* skip failed ticker */ }
          });

        const results = (await Promise.all(checks)).filter(
          (n): n is ComplianceChangeNotification => n != null
        );
        setNotifications(results);
      } catch { /* ignore */ }
    })();
  }, []);

  function dismiss(ticker: string) {
    setNotifications(prev => prev.filter(n => n.ticker !== ticker));
  }

  function dismissAll() {
    setNotifications([]);
  }

  return (
    <ComplianceNotificationBanner
      notifications={notifications}
      onDismiss={dismiss}
      onDismissAll={dismissAll}
    />
  );
}
