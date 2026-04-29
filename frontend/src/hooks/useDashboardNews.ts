/**
 * useDashboardNews Hook
 *
 * Fetches and merges news from multiple tickers.
 * Sorts by timestamp (descending) and limits results.
 *
 * Props:
 *   tickers: string[] — stock symbols to fetch news for
 *   limit: 3 | 6 — max headlines to return
 *
 * Returns: { items: DashboardNewsItem[], loading: boolean }
 *
 * Handles:
 * - Parallel fetches for multiple tickers
 * - Result merging and sorting
 * - Partial failures (returns available items)
 */

'use client';

import { useEffect, useState } from 'react';
import { getNews } from '@/lib/api';
import type { DashboardNewsItem, HalalStatus } from '@/lib/types';

interface UseDashboardNewsResult {
  items: DashboardNewsItem[];
  loading: boolean;
}

export function useDashboardNews(
  tickers: string[] = [],
  limit: 3 | 6 = 6
): UseDashboardNewsResult {
  const [items, setItems] = useState<DashboardNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tickers || tickers.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const fetchNews = async () => {
      try {
        setLoading(true);

        // Fetch news for all tickers in parallel
        const newsPromises = tickers.map(ticker =>
          getNews(ticker)
            .then(analysis => {
              // Transform NewsArticle[] to DashboardNewsItem[]
              return (analysis.articles || []).map(article => ({
                ticker,
                headline: article.title,
                source: article.source,
                timestamp: article.published_at,
                url: article.url,
                halalStatus: 'Unknown' as HalalStatus, // Default; could be fetched from getHalal API later
              }));
            })
            .catch(err => {
              console.warn(`[useDashboardNews] Error fetching news for ${ticker}:`, err);
              return [];
            })
        );

        const newsResults = await Promise.all(newsPromises);

        // Merge all results
        let merged: DashboardNewsItem[] = [];
        newsResults.forEach(tickerNews => {
          merged = merged.concat(tickerNews);
        });

        // Sort by timestamp descending (most recent first)
        merged.sort((a, b) => {
          const aTime = new Date(a.timestamp).getTime();
          const bTime = new Date(b.timestamp).getTime();
          return bTime - aTime;
        });

        // Limit results
        setItems(merged.slice(0, limit));
      } catch (error) {
        console.warn('[useDashboardNews] Error fetching news:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [tickers, limit]);

  return { items, loading };
}
