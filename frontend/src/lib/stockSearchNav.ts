/**
 * Resolve user search text to a real ticker via GET /api/search, then navigate or show picks.
 * Avoids using toUpperCase(query) as a ticker (e.g. "apple" → invalid "APPLE"; real symbol is AAPL).
 */

import { searchStocks } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

export function pickTickerFromSearchResults(
  query: string,
  results: SearchResult[]
): string {
  const q = query.trim().toUpperCase();
  const exact = results.find((r) => r.ticker.toUpperCase() === q);
  return (exact ?? results[0]).ticker;
}

export type StockSearchSubmitResult =
  | { kind: "navigate"; ticker: string }
  | { kind: "pick"; results: SearchResult[] }
  | { kind: "noResults" }
  | { kind: "error" };

/** Trimmed empty string → noResults (caller may skip calling). */
export async function runStockSearch(
  rawQuery: string
): Promise<StockSearchSubmitResult> {
  const q = rawQuery.trim();
  if (!q) return { kind: "noResults" };
  try {
    const results = await searchStocks(q);
    if (results.length === 0) return { kind: "noResults" };
    if (results.length === 1) {
      return { kind: "navigate", ticker: pickTickerFromSearchResults(q, results) };
    }
    return { kind: "pick", results };
  } catch {
    return { kind: "error" };
  }
}
