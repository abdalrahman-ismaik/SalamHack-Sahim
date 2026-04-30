/**
 * DashboardNewsCard — Single news headline card
 *
 * Displays one news item with ticker, halal status, headline, source, and link.
 *
 * Props:
 *   item: DashboardNewsItem — news item to display
 */

'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { DashboardNewsItem } from '@/lib/types';

export interface DashboardNewsCardProps {
  item: DashboardNewsItem;
}

const HALAL_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Halal: { bg: 'bg-[#00E676]/10', text: 'text-[#00E676]' },
  PurificationRequired: { bg: 'bg-[#FFB300]/10', text: 'text-[#FFB300]' },
  NonHalal: { bg: 'bg-[#FF1744]/10', text: 'text-[#FF1744]' },
  Unknown: { bg: 'bg-white/10', text: 'text-white/55' },
};

export function DashboardNewsCard({ item }: DashboardNewsCardProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard.news');
  const tDash = useTranslations('dashboard');
  const halalColors = HALAL_BADGE_COLORS[item.halalStatus] || HALAL_BADGE_COLORS.Unknown;
  const badgeLabel =
    item.halalStatus === 'Halal'
      ? `✓ ${t('status.halal')}`
      : item.halalStatus === 'PurificationRequired'
        ? `! ${t('status.purification')}`
        : item.halalStatus === 'NonHalal'
          ? `× ${t('status.nonHalal')}`
          : `? ${t('status.unknown')}`;

  // Format timestamp as relative time
  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return t('time.now');
      if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
      if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
      return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US');
    } catch {
      return ts;
    }
  };

  return (
    <motion.div
      role="article"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="group relative min-h-[190px] overflow-hidden rounded-xl border border-white/10 bg-[#101010]/85 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C5A059]/25 hover:bg-[#141414]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/35 to-transparent" />
      <div className="relative flex h-full flex-col space-y-3">
        {/* Header: Ticker + Halal Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full border border-[#C5A059]/20 bg-[#C5A059]/10 px-2.5 py-1 text-xs font-bold text-[#E8D4B0]">
            {item.ticker}
          </span>
          <div className="relative group/badge">
            <div
              aria-describedby={`halal-tooltip-news-${item.ticker}`}
              tabIndex={0}
              className={`${halalColors.bg} ${halalColors.text} cursor-help rounded-full px-2.5 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]`}
            >
              {badgeLabel}
            </div>
            <div
              id={`halal-tooltip-news-${item.ticker}`}
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-center text-xs text-white/80 opacity-0 transition-opacity group-hover/badge:opacity-100 group-focus-within/badge:opacity-100"
            >
              {tDash('disclaimer.halal')}
            </div>
          </div>
        </div>

        {/* Headline (Arabic, 2-line clamp) */}
        <h4 className="line-clamp-2 text-sm font-semibold leading-7 text-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {item.headline}
        </h4>

        {/* Footer: Source + Timestamp + Link */}
        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/40">
          <span>{item.source}</span>
          <span>{formatTimestamp(item.timestamp)}</span>
        </div>

        {/* Read More Link */}
        <Link
          href={`/${locale}/stock/${item.ticker}`}
          role="button"
          tabIndex={0}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#E8D4B0] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
        >
          {t('readMore')}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}
