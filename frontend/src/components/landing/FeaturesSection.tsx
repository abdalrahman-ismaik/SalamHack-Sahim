'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, MotionConfig } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ScrollFloat } from '@/components/ui/ScrollFloat';
import { StockSearchResultsList } from '@/components/landing/StockSearchResultsList';
import { runStockSearch } from '@/lib/stockSearchNav';
import type { SearchResult } from '@/lib/types';

const FEATURE_CARDS = [
  {
    id: 'stock-screener',
    color: 'text-[#C5A059]',
    bg: 'bg-[#C5A059]/10 border-[#C5A059]/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: 'halal-verdict',
    color: 'text-[#00E676]',
    bg: 'bg-[#00E676]/10 border-[#00E676]/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'news-agent',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    id: 'risk-dashboard',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

/** Mockup: Investment score card */
function ScoreMockup() {
  return (
    <div className="bg-[#0d0d0d] border border-[#2A2A2A] rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Investment Score</p>
          <p className="font-bold text-white mt-0.5">Saudi Aramco</p>
        </div>
        <div className="flex items-end gap-1">
          <div className="w-3 h-9 rounded-full bg-[#00E676]" />
          <div className="w-3 h-6 rounded-full bg-[#00E676]/50" />
          <div className="w-3 h-4 rounded-full bg-[#2A2A2A]" />
        </div>
      </div>
      <div className="mb-3">
        <span className="text-5xl font-extrabold text-[#00E676]">78</span>
        <span className="text-sm text-gray-500 ms-1">/ 100</span>
      </div>
      <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden mb-4">
        <div className="h-full w-[78%] bg-gradient-to-r from-[#C5A059] to-[#00E676] rounded-full" />
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="px-2.5 py-1 bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] text-xs rounded-full">Low Risk</span>
        <span className="px-2.5 py-1 bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] text-xs rounded-full">Halal ✓</span>
        <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs rounded-full">Positive</span>
      </div>
    </div>
  );
}

/** Mockup: Halal screening card */
function HalalMockup() {
  return (
    <div className="bg-[#0d0d0d] border border-[#2A2A2A] rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#00E676]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Shariah Screening</p>
          <p className="font-semibold text-white">Saudi Aramco</p>
        </div>
      </div>
      <div className="space-y-2.5 mb-5">
        {[
          { label: 'Revenue Screen', ok: true },
          { label: 'Debt Ratio (< 30%)', ok: true },
          { label: 'Business Activity', ok: true },
          { label: 'Interest Income', ok: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
            <span className="text-xs text-gray-400">{item.label}</span>
            <span className={`text-xs font-semibold ${item.ok ? 'text-[#00E676]' : 'text-[#FF1744]'}`}>
              {item.ok ? '✓ Pass' : '✗ Fail'}
            </span>
          </div>
        ))}
      </div>
      <div className="py-3 px-4 bg-[#00E676]/8 border border-[#00E676]/20 rounded-2xl text-center">
        <p className="text-[#00E676] font-bold text-sm">حلال — Halal</p>
        <p className="text-[10px] text-gray-500 mt-0.5">Musaffa · AAOIFI Standards</p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const t       = useTranslations('services');
  const tH      = useTranslations('landing.features');
  const tSearch = useTranslations('search');
  const locale  = useLocale();
  const router  = useRouter();
  const [ticker, setTicker] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);

  const goToStock = (sym: string) => {
    setSearchResults(null);
    router.push(`/${locale}/stock/${encodeURIComponent(sym)}`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults(null);
    try {
      const out = await runStockSearch(ticker);
      if (out.kind === 'noResults') {
        setSearchError(tSearch('noResults'));
        return;
      }
      if (out.kind === 'error') {
        setSearchError(tSearch('error'));
        return;
      }
      if (out.kind === 'navigate') {
        goToStock(out.ticker);
        return;
      }
      setSearchResults(out.results);
    } finally {
      setSearchLoading(false);
    }
  };
  return (
    <MotionConfig reducedMotion="never">
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative px-4 sm:px-6 py-28 overflow-hidden"
    >
      {/* Section divider top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ── Section Header ── */}
        <div id="try-stock" className="scroll-mt-24 text-center mb-20">
          <p className="text-xs text-[#C5A059] font-semibold uppercase tracking-[0.2em] mb-4">
            Features
          </p>
          <ScrollFloat
            id="features-heading"
            containerClassName="text-center"
            textClassName="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
          >
            {tH('title')}
          </ScrollFloat>
          <motion.p
            suppressHydrationWarning
            className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {tH('subtitle')}
          </motion.p>
        </div>

        {/* ── 4-card grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-28">
          {FEATURE_CARDS.map((card, index) => (
            <motion.div
              suppressHydrationWarning
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group bg-[#0d0d0d] border border-[#1e1e1e] rounded-3xl p-6 hover:border-[#2A2A2A] hover:bg-[#111] transition-all duration-300"
            >
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}
              >
                {card.icon}
              </div>
              <h3 className="font-semibold text-white text-sm mb-2 group-hover:text-[#C5A059] transition-colors duration-200">
                {t(`${card.id}.title` as Parameters<typeof t>[0])}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t(`${card.id}.description` as Parameters<typeof t>[0])}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Deep-dive heading ── */}
        <div className="text-center mb-20">
          <ScrollFloat
            id="features-deep-heading"
            containerClassName="text-center"
            textClassName="text-3xl md:text-4xl font-extrabold text-white"
          >
            {tH('deepTitle')}
          </ScrollFloat>
          <motion.p
            suppressHydrationWarning
            className="mt-3 text-gray-400 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {tH('deepSubtitle')}
          </motion.p>
        </div>

        {/* ── Showcase 1: Score (text left, visual right) ── */}
        <motion.div
          suppressHydrationWarning
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-28"
        >
          <div className="flex flex-col gap-5">
            <div className="w-10 h-1 rounded-full bg-[#C5A059]" />
            <h3 id="stock-search" className="scroll-mt-32 text-2xl md:text-3xl font-bold text-white leading-snug">
              {tH('showcase1Title')}
            </h3>
            <p className="text-gray-400 leading-relaxed text-base md:text-lg">
              {tH('showcase1Body')}
            </p>
            <form
              onSubmit={handleSearch}
              className="flex gap-2 mt-2"
              role="search"
            >
              <input
                type="text"
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value);
                  setSearchResults(null);
                  setSearchError(null);
                }}
                placeholder={tSearch('placeholder')}
                maxLength={50}
                disabled={searchLoading}
                aria-label={tSearch('placeholder')}
                aria-invalid={searchError != null}
                className="flex-1 bg-[#0d0d0d] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C5A059]/50 focus:ring-1 focus:ring-[#C5A059]/20 transition-colors disabled:opacity-60"
              />
              <Button type="submit" variant="gold" size="sm" disabled={searchLoading}>
                {searchLoading ? tSearch('loading') : tSearch('button')}
              </Button>
            </form>
            {searchError ? (
              <p className="mt-2 text-xs text-red-400/90" role="alert">{searchError}</p>
            ) : null}
            {searchResults && searchResults.length > 0 ? (
              <StockSearchResultsList
                results={searchResults}
                onPick={goToStock}
                className="mt-3 text-start"
              />
            ) : null}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#C5A059]/6 rounded-[3rem] blur-3xl scale-105 pointer-events-none" />
            <div className="relative">
              <ScoreMockup />
            </div>
          </div>
        </motion.div>

        {/* ── Showcase 2: Halal (visual left, text right) ── */}
        <motion.div
          suppressHydrationWarning
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          <div className="relative lg:order-first order-last">
            <div className="absolute inset-0 bg-[#00E676]/5 rounded-[3rem] blur-3xl scale-105 pointer-events-none" />
            <div className="relative">
              <HalalMockup />
            </div>
          </div>
          <div className="flex flex-col gap-5 lg:order-last order-first">
            <div className="w-10 h-1 rounded-full bg-[#00E676]" />
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug">
              {tH('showcase2Title')}
            </h3>
            <p className="text-gray-400 leading-relaxed text-base md:text-lg">
              {tH('showcase2Body')}
            </p>
            <a href={`/${locale}/auth/signup`}>
              <Button
                variant="outline"
                size="sm"
                className="self-start border-[#00E676]/30 text-[#00E676] hover:bg-[#00E676]/8 hover:border-[#00E676]/60"
              >
                {tH('showcase2Cta')} →
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
    </MotionConfig>
  );
}
