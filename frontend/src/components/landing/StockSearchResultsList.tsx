'use client';

import { useTranslations } from 'next-intl';
import type { SearchResult } from '@/lib/types';

interface StockSearchResultsListProps {
  results: SearchResult[];
  onPick: (ticker: string) => void;
  /** e.g. "mt-5 max-w-md mx-auto text-start" */
  className?: string;
}

export function StockSearchResultsList({
  results,
  onPick,
  className = 'mt-5 max-w-md mx-auto text-start',
}: StockSearchResultsListProps) {
  const tSearch = useTranslations('search');
  return (
    <div className={className} role="listbox" aria-label={tSearch('pickListing')}>
      <p className="text-xs text-gray-500 mb-2 px-1">{tSearch('pickListing')}</p>
      <ul className="max-h-56 overflow-y-auto rounded-xl border border-[#2A2A2A] bg-[#111] divide-y divide-[#2A2A2A]">
        {results.map((r) => (
          <li key={`${r.ticker}-${r.exchange}-${r.country}`} role="option">
            <button
              type="button"
              onClick={() => onPick(r.ticker)}
              aria-label={`${tSearch('open')}: ${r.ticker} ${r.exchange}`}
              className="w-full px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-start hover:bg-[#1a1a1a] transition-colors"
            >
              <span className="font-semibold text-white tabular-nums">
                {r.ticker}
                <span className="font-normal text-gray-400 ms-2">{r.name}</span>
              </span>
              <span className="text-xs text-gray-500 shrink-0">
                {r.exchange}
                {r.country ? ` · ${r.country}` : ''}
                {r.type ? ` · ${r.type}` : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
