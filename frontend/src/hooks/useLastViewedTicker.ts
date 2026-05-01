/**
 * useLastViewedTicker Hook
 *
 * Reads and writes the user's most-recently-viewed stock ticker symbol.
 * Stored in: users/{id}.lastViewedTicker
 *
 * Returns: { ticker: string | null, setTicker: (t: string) => void }
 *
 * Usage:
 *   const { ticker, setTicker } = useLastViewedTicker();
 *   // Read: ticker contains last viewed symbol or null
 *   // Write: setTicker('AAPL') updates Firestore and local state
 */

'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { UserContext } from '@/providers/UserContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { saveLastViewedTicker } from '@/lib/firestore-user';

interface UseLastViewedTickerResult {
  ticker: string | null;
  setTicker: (ticker: string) => void;
}

export function useLastViewedTicker(): UseLastViewedTickerResult {
  const session = useContext(UserContext);
  const [ticker, setTickerState] = useState<string | null>(null);

  // Fetch initial value on mount
  useEffect(() => {
    if (!session?.id) {
      setTickerState(null);
      return;
    }

    const fetchTicker = async () => {
      try {
        const userRef = doc(db, 'users', session.id);
        const snapshot = await getDoc(userRef);
        
        if (snapshot.exists()) {
          setTickerState(snapshot.data()?.lastViewedTicker ?? null);
        }
      } catch (error) {
        console.warn('[useLastViewedTicker] Error fetching ticker:', error);
        setTickerState(null);
      }
    };

    fetchTicker();
  }, [session?.id]);

  // Write new ticker to Firestore and update local state
  const setTicker = useCallback(async (newTicker: string) => {
    if (!session?.id) return;

    try {
      const normalized = newTicker.trim().toUpperCase();
      await saveLastViewedTicker(session.id, normalized);
      setTickerState(normalized);
    } catch (error) {
      console.warn('[useLastViewedTicker] Error updating ticker:', error);
    }
  }, [session?.id]);

  return { ticker, setTicker };
}
