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
import type { DashboardNewsItem } from '@/lib/types';

export interface DashboardNewsCardProps {
  item: DashboardNewsItem;
}

const HALAL_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Halal: { bg: 'bg-[#00E676]/10', text: 'text-[#00E676]' },
  PurificationRequired: { bg: 'bg-[#FFB300]/10', text: 'text-[#FFB300]' },
  NonHalal: { bg: 'bg-[#FF1744]/10', text: 'text-[#FF1744]' },
};

export function DashboardNewsCard({ item }: DashboardNewsCardProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard.news');
  const tDash = useTranslations('dashboard');
  const halalColors = HALAL_BADGE_COLORS[item.halalStatus] || HALAL_BADGE_COLORS.Halal;

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
      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/[0.07] transition-colors"
    >
      <div className="space-y-3">
        {/* Header: Ticker + Halal Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-mono font-bold text-[#C5A059]">
            {item.ticker}
          </span>
          <div className="relative group/badge">
            <div
              aria-describedby={`halal-tooltip-news-${item.ticker}`}
              tabIndex={0}
              className={`${halalColors.bg} ${halalColors.text} rounded px-2 py-0.5 text-xs font-semibold cursor-help`}
            >
              {item.halalStatus === 'Halal'
                ? `✓ ${t('status.halal')}`
                : item.halalStatus === 'PurificationRequired'
                  ? `⚠ ${t('status.purification')}`
                  : `✕ ${t('status.nonHalal')}`}
            </div>
            <div
              id={`halal-tooltip-news-${item.ticker}`}
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded bg-[#1a1a1a] border border-white/10 px-2 py-1.5 text-xs text-white/80 opacity-0 group-hover/badge:opacity-100 focus-within:opacity-100 transition-opacity z-50 text-center whitespace-normal"
            >
              {tDash('disclaimer.halal')}
            </div>
          </div>
        </div>

        {/* Headline (Arabic, 2-line clamp) */}
        <h4 className="text-sm font-semibold text-white line-clamp-2 leading-relaxed" dir="rtl">
          {item.headline}
        </h4>

        {/* Footer: Source + Timestamp + Link */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/5">
          <span>{item.source}</span>
          <span>{formatTimestamp(item.timestamp)}</span>
        </div>

        {/* Read More Link */}
        <Link
          href={`/${locale}/stock/${item.ticker}`}
          role="button"
          tabIndex={0}
          className="inline-block mt-2 text-xs text-[#C5A059] hover:text-[#E8D4B0] font-semibold transition-colors"
        >
          {t('readMore')} →
        </Link>
      </div>
    </motion.div>
  );
}
