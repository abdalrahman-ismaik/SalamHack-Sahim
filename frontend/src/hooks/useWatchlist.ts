/**
 * useWatchlist Hook
 *
 * Fetches the user's watchlist (array of stock tickers) from Firestore.
 * Reads from: users/{id}/watchlist subcollection
 *
 * Returns: { tickers: string[], loading: boolean }
 *
 * Handles:
 * - Loading state during initial fetch
 * - Silent failure (returns empty array on error, logs console.warn)
 */

'use client';

import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/providers/UserContext';
import {
  listWatchlistTickers,
  normalizeWatchlistTicker,
  removeWatchlistItem,
  saveWatchlistItem,
} from '@/lib/watchlist-storage';
import type { HalalStatus } from '@/lib/types';

interface UseWatchlistResult {
  tickers: string[];
  loading: boolean;
  saveTicker: (ticker: string, metadata?: { name?: string | null; exchange?: string | null; halalStatus?: HalalStatus | null }) => Promise<void>;
  removeTicker: (ticker: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useWatchlist(): UseWatchlistResult {
  const session = useContext(UserContext);
  const [tickers, setTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!session?.id) {
      setTickers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setTickers(await listWatchlistTickers(session.id));
    } catch (error) {
      console.warn('[useWatchlist] Error fetching watchlist:', error);
      setTickers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  const saveTicker: UseWatchlistResult['saveTicker'] = async (ticker, metadata = {}) => {
    if (!session?.id) return;
    const normalized = normalizeWatchlistTicker(ticker);
    if (!normalized) return;

    await saveWatchlistItem(session.id, { ticker: normalized, ...metadata });
    setTickers(prev => Array.from(new Set([...prev, normalized])).sort());
  };

  const removeTicker: UseWatchlistResult['removeTicker'] = async ticker => {
    if (!session?.id) return;
    const normalized = normalizeWatchlistTicker(ticker);
    if (!normalized) return;

    await removeWatchlistItem(session.id, normalized);
    setTickers(prev => prev.filter(item => item !== normalized));
  };

  return { tickers, loading, saveTicker, removeTicker, refresh };
}
