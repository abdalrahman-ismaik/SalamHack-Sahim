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
import type { DashboardKPI } from '@/lib/types';

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

export function useDashboardKPI(): UseDashboardKPIResult {
  const session = useContext(UserContext);
  const [kpi, setKpi] = useState<DashboardKPI>(DEFAULT_KPI);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.id) {
      setKpi(DEFAULT_KPI);
      setLoading(false);
      return;
    }

    const fetchKPI = async () => {
      try {
        setLoading(true);
        const userRef = doc(db, 'users', session.id);
        const snapshot = await getDoc(userRef);
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          setKpi({
            watchlistCount: data?.watchlistCount ?? 0,
            halalComplianceRate: data?.halalComplianceRate ?? null,
            riskProfile: data?.riskProfile ?? null,
            lastZakatDate: data?.lastZakatDate ?? null,
            lastViewedTicker: data?.lastViewedTicker ?? null,
          });
        } else {
          setKpi(DEFAULT_KPI);
        }
      } catch (error) {
        console.warn('[useDashboardKPI] Error fetching KPI:', error);
        setKpi(DEFAULT_KPI);
      } finally {
        setLoading(false);
      }
    };

    fetchKPI();
  }, [session?.id]);

  return { kpi, loading };
}
