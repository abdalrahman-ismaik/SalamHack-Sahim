'use client';

import { useState, useEffect } from 'react';
import { useWatchlist } from './useWatchlist';
import { getSectors } from '@/lib/api';

export interface PortfolioSectorSlice {
  sector: string;
  value: number;
}

export interface UseDashboardPortfolioResult {
  sectors: PortfolioSectorSlice[];
  loading: boolean;
}

/**
 * Aggregates watchlist tickers by their sector using the /sectors endpoint.
 * Returns sector counts suitable for DashboardPortfolioChart.
 */
export function useDashboardPortfolio(): UseDashboardPortfolioResult {
  const { tickers, loading: watchlistLoading } = useWatchlist();
  const [sectors, setSectors] = useState<PortfolioSectorSlice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (watchlistLoading) return;

    if (tickers.length === 0) {
      setSectors([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSectors() {
      setLoading(true);

      // Fetch sector for each ticker in parallel; silently ignore failures
      const results = await Promise.allSettled(
        tickers.map(ticker => getSectors(ticker))
      );

      if (cancelled) return;

      // Aggregate by sector name → count
      const counts: Record<string, number> = {};
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value?.sector) {
          const sectorName = result.value.sector;
          counts[sectorName] = (counts[sectorName] ?? 0) + 1;
        }
      });

      const slices: PortfolioSectorSlice[] = Object.entries(counts).map(
        ([sector, value]) => ({ sector, value })
      );

      // Sort descending by count
      slices.sort((a, b) => b.value - a.value);

      setSectors(slices);
      setLoading(false);
    }

    fetchSectors();

    return () => {
      cancelled = true;
    };
  }, [tickers, watchlistLoading]);

  return { sectors, loading: watchlistLoading || loading };
}
