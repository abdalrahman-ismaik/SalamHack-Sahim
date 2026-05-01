'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { mergeUserDocument } from '@/lib/firestore-user';
import { RiskWizard } from '@/components/RiskWizard';
import type { RiskProfile } from '@/lib/types';
import { getStoredRiskProfile, setStoredRiskProfile } from '@/lib/risk-profile-storage';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function RiskWizardPage() {
  const t = useTranslations('riskWizard');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'ar';

  const [uid, setUid]                   = useState<string | null>(null);
  const [initialProfile, setInitial]    = useState<RiskProfile | null>(null);
  const [loaded, setLoaded]             = useState(false);

  // Subscribe to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setUid(user?.uid ?? null));
    return unsub;
  }, []);

  // Load saved profile once uid is known
  useEffect(() => {
    async function loadProfile() {
      if (uid) {
        try {
          const ref  = doc(db, 'users', uid, 'risk_profile', 'current');
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setInitial(snap.data() as RiskProfile);
          }
        } catch {
          // If Firestore fails, fall through to localStorage
        }
      }

      if (!initialProfile) {
        setInitial(getStoredRiskProfile());
      }

      setLoaded(true);
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handleComplete = useCallback(async (profile: RiskProfile) => {
    const withUid: RiskProfile = { ...profile, user_id: uid };

    // Always persist to localStorage (works for guests too)
    setStoredRiskProfile(withUid);

    // If signed in, persist both the full profile and the KPI fields the dashboard reads.
    if (uid) {
      try {
        const profileRef = doc(db, 'users', uid, 'risk_profile', 'current');
        await Promise.all([
          setDoc(profileRef, withUid),
          mergeUserDocument(uid, {
            riskProfile: String(withUid.score),
            riskProfileLabel: withUid.label,
            riskProfileAnswers: withUid.answers,
            riskProfileCompletedAt: withUid.completed_at,
          }),
        ]);
      } catch {
        // Silently ignore — localStorage copy is already saved
      }
    }
  }, [uid]);

  if (!loaded) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" aria-label="جاري التحميل" />
      </main>
    );
  }

  return (
    <DashboardShell selectedTicker={ 'AAPL'}>
    <main
      className="mx-auto max-w-xl px-4 py-10"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      </div>
      <div className="rounded-2xl border border-gray-700 bg-gray-900/60 backdrop-blur-sm p-6 shadow-xl">
        <RiskWizard
          onComplete={handleComplete}
          initialAnswers={initialProfile?.answers as Record<string, number> | undefined}
        />
      </div>
    </main>
    </DashboardShell>
  );
}
