/**
 * useDashboardArima Hook
 *
 * Fetches ARIMA forecast data for a given stock ticker.
 * Wraps the backend API call and handles loading/error states.
 *
 * Props:
 *   ticker: string — stock symbol (e.g., 'AAPL')
 *
 * Returns: { data: ArimaChartPoint[], loading: boolean, error: boolean }
 *
 * Handles:
 * - Silent retry on failure
 * - Returns empty array on persistent error
 */

'use client';

import { useEffect, useState } from 'react';
import { getArima } from '@/lib/api';
import type { ArimaChartPoint } from '@/lib/types';

interface UseDashboardArimaResult {
  data: ArimaChartPoint[];
  loading: boolean;
  error: boolean;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

export function useDashboardArima(ticker: string): UseDashboardArimaResult {
  const [data, setData] = useState<ArimaChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ticker) {
      setData([]);
      setLoading(false);
      setError(false);
      return;
    }

    let retries = 0;
    let isActive = true;

    const fetchArima = async () => {
      try {
        setLoading(true);
        setError(false);

        const result = await getArima(ticker);
        if (isActive && result) {
          // Transform parallel arrays into ArimaChartPoint objects
          const transformed: ArimaChartPoint[] = result.forecast_dates.map(
            (date, idx) => ({
              date,
              price: result.forecast_values[idx] || 0,
              ci_lower: result.ci_lower[idx] || 0,
              ci_upper: result.ci_upper[idx] || 0,
            })
          );
          setData(transformed);
          setError(false);
        }
      } catch (err) {
        console.warn(`[useDashboardArima] Error fetching ARIMA for ${ticker}:`, err);

        if (retries < MAX_RETRIES) {
          retries++;
          setTimeout(fetchArima, RETRY_DELAY_MS * retries);
        } else if (isActive) {
          setData([]);
          setError(true);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchArima();

    return () => {
      isActive = false;
    };
  }, [ticker]);

  return { data, loading, error };
}
