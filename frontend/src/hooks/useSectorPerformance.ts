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
import type { SectorBar } from '@/lib/types';

interface UseSectorPerformanceResult {
  sectors: SectorBar[];
  loading: boolean;
}

// Mock market index for fetching overall sector performance
const MARKET_INDEX = 'TASI';

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
        
        // Transform SectorComparison to SectorBar array if needed
        // For now, assume result is already compatible with SectorBar[]
        setSectors(result as unknown as SectorBar[]);
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
