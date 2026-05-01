'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StockSearchResultsList } from '@/components/landing/StockSearchResultsList';
import { runStockSearch } from '@/lib/stockSearchNav';
import type { SearchResult } from '@/lib/types';

export default function StockIndexPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('search');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[] | null>(null);

  const goToTicker = (ticker: string) => {
    setResults(null);
    router.push(`/${locale}/stock/${encodeURIComponent(ticker)}`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const out = await runStockSearch(query);
      if (out.kind === 'noResults') {
        setError(t('noResults'));
        return;
      }
      if (out.kind === 'error') {
        setError(t('error'));
        return;
      }
      if (out.kind === 'navigate') {
        goToTicker(out.ticker);
        return;
      }
      setResults(out.results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell selectedTicker={query.trim().toUpperCase() || 'AAPL'}>
      <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#111]/90 p-5 md:p-8">
        <div className="mb-4">
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex rounded-lg border border-[#C5A059]/35 bg-[#C5A059]/10 px-3 py-1.5 text-xs font-medium text-[#E8D4B0] hover:bg-[#C5A059]/15"
          >
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white">{t('button')}</h1>
        <p className="mt-2 text-sm text-white/60">{t('placeholder')}</p>

        <form onSubmit={onSubmit} role="search" className="mt-6 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
              setResults(null);
            }}
            placeholder={t('placeholder')}
            maxLength={50}
            disabled={loading}
            className="flex-1 h-12 rounded-xl border border-[#2A2A2A] bg-[#111] px-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C5A059]/50 focus:ring-1 focus:ring-[#C5A059]/20 disabled:opacity-60"
            aria-label={t('placeholder')}
            aria-invalid={error != null}
          />
          <Button type="submit" variant="gold" disabled={loading}>
            {loading ? t('loading') : t('button')}
          </Button>
        </form>

        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        {results && results.length > 0 ? (
          <StockSearchResultsList
            results={results}
            onPick={goToTicker}
            className="mt-5 text-start"
          />
        ) : null}
      </div>
    </main>
    </DashboardShell>
  );
}
