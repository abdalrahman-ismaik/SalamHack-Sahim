/**
 * useSectorPerformance Hook
 *
 * Fetches overall market sector performance data.
 * Used to populate the sector bar chart (Zone 5).
 *
 * Props:
 *   period: 'week' | 'month' | 'quarter' — time period (for future API expansion)
 *
 * Returns: { sectors: SectorBar[], loading: boolean }
 *
 * Handles:
 * - Loading state
 * - Graceful failure (returns empty array)
 */

'use client';

import { useEffect, useState } from 'react';
import { getSectors } from '@/lib/api';
import type { SectorBar, SectorComparison } from '@/lib/types';

interface UseSectorPerformanceResult {
  sectors: SectorBar[];
  loading: boolean;
}

// Mock market index for fetching overall sector performance
const MARKET_INDEX = 'TASI';

function toSectorBars(result: unknown): SectorBar[] {
  if (Array.isArray(result)) {
    return result
      .filter((item): item is SectorBar => (
        typeof item?.sector === 'string' &&
        typeof item?.value === 'number'
      ))
      .map(item => ({
        ...item,
        positive: typeof item.positive === 'boolean' ? item.positive : item.value >= 0,
      }));
  }

  const comparison = result as Partial<SectorComparison> | null;
  if (comparison?.sector && typeof comparison.avg_score === 'number') {
    return [{
      sector: comparison.sector,
      value: Math.round((comparison.avg_score - 50) * 10) / 10,
      positive: comparison.avg_score >= 50,
    }];
  }

  return [];
}

export function useSectorPerformance(
  _period: 'week' | 'month' | 'quarter' = 'month'
): UseSectorPerformanceResult {
  const [sectors, setSectors] = useState<SectorBar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoading(true);
        const result = await getSectors(MARKET_INDEX);
        
        setSectors(toSectorBars(result));
      } catch (error) {
        console.warn('[useSectorPerformance] Error fetching sectors:', error);
        setSectors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, [_period]);

  return { sectors, loading };
}
