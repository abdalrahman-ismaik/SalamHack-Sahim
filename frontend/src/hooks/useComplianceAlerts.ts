'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getHalal } from '@/lib/api';
import type { HalalStatus, ComplianceAlertPreference, ComplianceChangeNotification } from '@/lib/types';

interface UseComplianceAlertsReturn {
  enabled: boolean;
  toggle: () => Promise<void>;
  lastKnownStatus: HalalStatus | null;
  notifications: ComplianceChangeNotification[];
  dismissNotification: (ticker: string) => void;
  loading: boolean;
}

export function useComplianceAlerts(ticker: string): UseComplianceAlertsReturn {
  const [enabled, setEnabled]             = useState(false);
  const [lastKnownStatus, setLastKnown]   = useState<HalalStatus | null>(null);
  const [notifications, setNotifications] = useState<ComplianceChangeNotification[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { setLoading(false); return; }

    const prefPath = `users/${user.uid}/alert_preferences/${ticker}`;
    const prefRef  = doc(db, prefPath);

    (async () => {
      try {
        const snap = await getDoc(prefRef);
        if (snap.exists()) {
          const pref = snap.data() as ComplianceAlertPreference;
          setEnabled(pref.enabled);
          setLastKnown(pref.last_known_status ?? null);

          // Check for status change
          if (pref.last_known_status) {
            try {
              const verdict = await getHalal(ticker);
              if (verdict.status !== pref.last_known_status) {
                const notification: ComplianceChangeNotification = {
                  ticker,
                  previous_status: pref.last_known_status,
                  current_status:  verdict.status,
                  detected_at:     new Date().toISOString(),
                };
                setNotifications(prev => [...prev, notification]);
                // Update stored status after detecting change
                await setDoc(prefRef, { last_known_status: verdict.status }, { merge: true });
                setLastKnown(verdict.status);
              }
            } catch {
              // status check failed — leave notifications unchanged
            }
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [ticker]);

  const toggle = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    const prefRef = doc(db, `users/${user.uid}/alert_preferences/${ticker}`);
    const newEnabled = !enabled;

    // Get latest status to store when enabling
    let currentStatus: HalalStatus | null = lastKnownStatus;
    if (newEnabled && !currentStatus) {
      try {
        const verdict = await getHalal(ticker);
        currentStatus = verdict.status;
      } catch {
        // proceed without status
      }
    }

    const pref: Partial<ComplianceAlertPreference> = {
      enabled:           newEnabled,
      updated_at:        new Date().toISOString(),
      ...(currentStatus ? { last_known_status: currentStatus } : {}),
    };

    await setDoc(prefRef, pref, { merge: true });
    setEnabled(newEnabled);
    if (currentStatus) setLastKnown(currentStatus);
  }, [enabled, lastKnownStatus, ticker]);

  const dismissNotification = useCallback((t: string) => {
    setNotifications(prev => prev.filter(n => n.ticker !== t));
  }, []);

  return { enabled, toggle, lastKnownStatus, notifications, dismissNotification, loading };
}
