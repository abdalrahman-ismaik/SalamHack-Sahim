/**
 * useDashboardKPI Hook
 *
 * Fetches key performance indicators (KPIs) from the Firestore user document.
 * Reads from: users/{id}
 * Fields: watchlistCount, halalComplianceRate, riskProfile, lastZakatDate, lastViewedTicker
 *
 * Returns: { kpi: DashboardKPI, loading: boolean }
 *
 * Handles:
 * - Missing fields (returns sensible defaults: null for optional fields)
 * - Silent failure (returns empty DashboardKPI on error)
 */

'use client';

import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/providers/UserContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getStoredRiskProfile } from '@/lib/risk-profile-storage';
import type { DashboardKPI, RiskProfile } from '@/lib/types';

interface UseDashboardKPIResult {
  kpi: DashboardKPI;
  loading: boolean;
}

const DEFAULT_KPI: DashboardKPI = {
  watchlistCount: 0,
  halalComplianceRate: null,
  riskProfile: null,
  lastZakatDate: null,
  lastViewedTicker: null,
};

function kpiFromStoredRiskProfile(): DashboardKPI {
  const profile = getStoredRiskProfile();
  if (!profile) return DEFAULT_KPI;

  return {
    ...DEFAULT_KPI,
    riskProfile: String(profile.score),
  };
}

export function useDashboardKPI(): UseDashboardKPIResult {
  const session = useContext(UserContext);
  const [kpi, setKpi] = useState<DashboardKPI>(DEFAULT_KPI);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.id) {
      setKpi(kpiFromStoredRiskProfile());
      setLoading(false);
      return;
    }

    const fetchKPI = async () => {
      try {
        setLoading(true);
        const userRef = doc(db, 'users', session.id);
        const profileRef = doc(db, 'users', session.id, 'risk_profile', 'current');

        const [snapshot, profileSnapshot] = await Promise.all([
          getDoc(userRef),
          getDoc(profileRef).catch(() => null),
        ]);

        const localProfile = getStoredRiskProfile();
        const firestoreProfile =
          profileSnapshot?.exists() ? (profileSnapshot.data() as RiskProfile) : null;
        const savedProfile = firestoreProfile ?? localProfile;
        const savedRiskScore = savedProfile?.score != null ? String(savedProfile.score) : null;

        if (snapshot.exists()) {
          const data = snapshot.data();
          setKpi({
            watchlistCount: data?.watchlistCount ?? 0,
            halalComplianceRate: data?.halalComplianceRate ?? null,
            riskProfile: data?.riskProfile ?? savedRiskScore,
            lastZakatDate: data?.lastZakatDate ?? null,
            lastViewedTicker: data?.lastViewedTicker ?? null,
          });
        } else {
          setKpi({
            ...DEFAULT_KPI,
            riskProfile: savedRiskScore,
          });
        }
      } catch (error) {
        console.warn('[useDashboardKPI] Error fetching KPI:', error);
        setKpi(kpiFromStoredRiskProfile());
      } finally {
        setLoading(false);
      }
    };

    fetchKPI();

    window.addEventListener('sahim:onboarding-completed', fetchKPI);

    return () => {
      window.removeEventListener('sahim:onboarding-completed', fetchKPI);
    };
  }, [session?.id]);

  return { kpi, loading };
}
