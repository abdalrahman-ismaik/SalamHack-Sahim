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
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface UseWatchlistResult {
  tickers: string[];
  loading: boolean;
}

export function useWatchlist(): UseWatchlistResult {
  const session = useContext(UserContext);
  const [tickers, setTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.id) {
      setTickers([]);
      setLoading(false);
      return;
    }

    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const watchlistRef = collection(db, `users/${session.id}/watchlist`);
        const snapshot = await getDocs(watchlistRef);
        
        const tickerList = snapshot.docs.map(doc => doc.id);
        setTickers(tickerList);
      } catch (error) {
        console.warn('[useWatchlist] Error fetching watchlist:', error);
        setTickers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [session?.id]);

  return { tickers, loading };
}
