'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { ApiError, getNews, searchStocks } from '@/lib/api';
import type { NewsAnalysis, SearchResult } from '@/lib/types';

export default function NewsPreviewPage() {
  const locale = useLocale();
  const t = useTranslations('services');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NewsAnalysis | null>(null);

  const handleCompanySearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearchLoading(true);
    setError(null);
    setResults([]);
    setSelectedTicker(null);
    setData(null);
    try {
      const response = await searchStocks(q);
      setResults(response);
      if (response.length === 0) {
        setError('No tickers found for this company.');
      }
    } catch {
      setError('Failed to search company/ticker.');
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchNews = async () => {
    const sym = (selectedTicker ?? '').trim().toUpperCase();
    if (!sym) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getNews(sym);
      setData(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`API error ${err.status}`);
      } else {
        setError('Failed to fetch news');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell selectedTicker={selectedTicker ?? 'AAPL'}>
      <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#111]/90 p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-white">{t('news-agent.title')}</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">{t('news-agent.description')}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Company name or ticker (e.g. Apple, AAPL)"
              maxLength={60}
              className="h-11 min-w-[220px] rounded-xl border border-[#2A2A2A] bg-[#101010] px-4 text-sm text-white outline-none focus:border-[#C5A059]/50"
              aria-label="Company name or ticker"
            />
            <Button type="button" onClick={handleCompanySearch} disabled={searchLoading}>
              {searchLoading ? 'Searching...' : 'Search company'}
            </Button>
            <Button type="button" onClick={fetchNews} disabled={loading || !selectedTicker}>
              {loading ? 'Loading...' : selectedTicker ? `Preview news for ${selectedTicker}` : 'Pick ticker first'}
            </Button>
            <Link
              href={`/${locale}/dashboard`}
              className="inline-flex rounded-lg border border-[#C5A059]/35 bg-[#C5A059]/10 px-4 py-2 text-sm font-medium text-[#E8D4B0] hover:bg-[#C5A059]/15"
            >
              Back to Dashboard
            </Link>
          </div>

          {results.length > 0 && (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Select ticker</p>
              <ul className="mt-3 space-y-2">
                {results.map((item) => {
                  const picked = selectedTicker === item.ticker;
                  return (
                    <li key={`${item.ticker}-${item.exchange}-${item.country}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedTicker(item.ticker)}
                        className={`w-full rounded-lg border px-3 py-2 text-start text-sm transition-colors ${
                          picked
                            ? 'border-[#C5A059]/50 bg-[#C5A059]/10 text-[#E8D4B0]'
                            : 'border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="font-semibold">{item.ticker}</span>
                        <span className="ms-2 text-white/60">{item.name}</span>
                        <span className="ms-2 text-xs text-white/45">({item.exchange})</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Sentiment</p>
              <p className="mt-2 text-lg font-semibold text-white">{data?.sentiment ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">News unavailable</p>
              <p className="mt-2 text-lg font-semibold text-white">{data ? String(data.news_unavailable) : '—'}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">Arabic summary</p>
            <p className="mt-2 text-sm leading-6 text-white/85">{data?.summary_ar || '—'}</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Key risks</p>
              <ul className="mt-2 space-y-1 text-sm text-white/85">
                {(data?.key_risks ?? []).map((item, idx) => <li key={`${idx}-${item}`}>• {item}</li>)}
                {(data?.key_risks?.length ?? 0) === 0 && <li>—</li>}
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Key opportunities</p>
              <ul className="mt-2 space-y-1 text-sm text-white/85">
                {(data?.key_opportunities ?? []).map((item, idx) => <li key={`${idx}-${item}`}>• {item}</li>)}
                {(data?.key_opportunities?.length ?? 0) === 0 && <li>—</li>}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
