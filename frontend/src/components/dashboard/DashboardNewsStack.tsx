'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Newspaper, Radio } from 'lucide-react';
import type { DashboardNewsItem } from '@/lib/types';

interface DashboardNewsStackProps {
  items: DashboardNewsItem[];
  loading?: boolean;
}

const fallbackNews: DashboardNewsItem[] = [
  {
    ticker: 'TASI',
    headline: 'Market breadth improves as energy and banking names lead early momentum',
    source: 'Sahim Market Desk',
    timestamp: new Date().toISOString(),
    url: '#',
    halalStatus: 'Halal',
  },
  {
    ticker: 'AAPL',
    headline: 'Large-cap technology stocks steady ahead of earnings guidance updates',
    source: 'Global Markets',
    timestamp: new Date(Date.now() - 1000 * 60 * 36).toISOString(),
    url: '#',
    halalStatus: 'Halal',
  },
  {
    ticker: 'NVDA',
    headline: 'AI infrastructure demand keeps semiconductor sentiment elevated',
    source: 'Equity Wire',
    timestamp: new Date(Date.now() - 1000 * 60 * 83).toISOString(),
    url: '#',
    halalStatus: 'PurificationRequired',
  },
];

const visualBackgrounds = [
  'linear-gradient(135deg, rgba(197,160,89,0.95), rgba(18,18,18,0.92) 54%, rgba(0,230,118,0.48))',
  'linear-gradient(135deg, rgba(56,189,248,0.82), rgba(18,18,18,0.94) 55%, rgba(197,160,89,0.42))',
  'linear-gradient(135deg, rgba(255,179,0,0.8), rgba(18,18,18,0.94) 48%, rgba(255,23,68,0.38))',
  'linear-gradient(135deg, rgba(124,58,237,0.65), rgba(18,18,18,0.94) 58%, rgba(0,230,118,0.35))',
];

function formatRelative(timestamp: string, locale: string, t: ReturnType<typeof useTranslations>) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60)));
  if (diffMinutes < 1) return t('now');
  if (diffMinutes < 60) return t('minutesAgo', { count: diffMinutes });
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return t('hoursAgo', { count: hours });
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US');
}

function MarketVisual({ index, ticker }: { index: number; ticker: string }) {
  const bars = [34, 62, 48, 78, 54, 88, 70];

  return (
    <div
      className="relative h-28 overflow-hidden rounded-2xl border border-white/10 p-3"
      style={{ backgroundImage: visualBackgrounds[index % visualBackgrounds.length] }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.13)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.11)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-black/28 px-2 py-1 text-[11px] font-bold text-white">{ticker}</span>
          <Radio className="h-4 w-4 text-white/75" aria-hidden="true" />
        </div>
        <div className="flex h-12 items-end gap-1.5">
          {bars.map((height, barIndex) => (
            <span
              key={barIndex}
              className={`flex-1 rounded-t-sm ${barIndex === index % bars.length ? 'bg-white' : 'bg-white/42'}`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardNewsStack({ items, loading = false }: DashboardNewsStackProps) {
  const t = useTranslations('dashboard.newsStack');
  const timeT = useTranslations('dashboard.newsStack.time');
  const locale = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);

  const news = useMemo(() => {
    const merged = [...items, ...fallbackNews].slice(0, 5);
    return merged.length > 0 ? merged : fallbackNews;
  }, [items]);

  useEffect(() => {
    if (news.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex(index => (index + 1) % news.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [news.length]);

  const activeItem = news[activeIndex % news.length];
  const stacked = news.slice(0, 3);

  if (loading) {
    return (
      <div className="h-full min-h-[420px] animate-pulse rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
        <div className="h-5 w-32 rounded bg-white/10" />
        <div className="mt-6 h-28 rounded-2xl bg-white/10" />
        <div className="mt-5 space-y-3">
          <div className="h-20 rounded-2xl bg-white/10" />
          <div className="h-20 rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <section className="relative h-full min-h-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-[#101010]/92 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/55 to-transparent" />
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#C5A059]">{t('eyebrow')}</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{t('title')}</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#C5A059]/25 bg-[#C5A059]/10 text-[#E8D4B0]">
          <Newspaper className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.article
          key={`${activeItem.ticker}-${activeIndex}`}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/10 bg-white/[0.045] p-3"
        >
          <MarketVisual index={activeIndex} ticker={activeItem.ticker} />
          <div className="p-2">
            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
              <span className="rounded-full border border-[#C5A059]/25 bg-[#C5A059]/10 px-2.5 py-1 font-semibold text-[#E8D4B0]">
                {activeItem.source}
              </span>
              <span className="text-white/38">{formatRelative(activeItem.timestamp, locale, timeT)}</span>
            </div>
            <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-7 text-white">
              {activeItem.headline}
            </h3>
            <Link
              href={`/${locale}/stock/${activeItem.ticker}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E8D4B0] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            >
              {t('open')}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.article>
      </AnimatePresence>

      <div className="mt-4 space-y-2">
        {stacked.map((item, index) => (
          <button
            key={`${item.ticker}-${item.timestamp}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
              index === activeIndex % news.length
                ? 'border-[#C5A059]/35 bg-[#C5A059]/10'
                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.055]'
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-bold text-white">
              {item.ticker.slice(0, 3)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">{item.headline}</span>
              <span className="mt-0.5 block text-xs text-white/40">{item.source}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
