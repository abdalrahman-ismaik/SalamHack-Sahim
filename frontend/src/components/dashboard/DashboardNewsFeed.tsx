/**
 * DashboardNewsFeed — News feed container showing multiple news items
 *
 * Displays grid of news cards from useD ashboardNews hook.
 * Shows empty state when no watchlist or news available.
 *
 * Props:
 *   items: DashboardNewsItem[] — news items to display
 *   loading?: boolean
 */

'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/motion';
import { DashboardNewsCard } from '@/components/dashboard/DashboardNewsCard';
import type { DashboardNewsItem, UserTier } from '@/lib/types';
import Link from 'next/link';

export interface DashboardNewsFeedProps {
  items: DashboardNewsItem[];
  loading?: boolean;
  tier?: UserTier;
}

export function DashboardNewsFeed({
  items,
  loading = false,
  tier = 'guest',
}: DashboardNewsFeedProps) {
  const t = useTranslations('dashboard.news');
  const locale = useLocale();
  const isFreeTier = tier === 'free';
  const displayItems = isFreeTier ? items.slice(0, 3) : items;

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#121212] border border-[#2A2A2A] rounded-lg h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center space-y-4">
        <p className="text-gray-400 text-sm">{t('empty')}</p>
        <Link
          href={`/${locale}/stock`}
          role="button"
          tabIndex={0}
          className="inline-block px-4 py-2 bg-[#C5A059]/10 text-[#C5A059] rounded-lg hover:bg-[#C5A059]/20 transition-colors text-sm font-medium"
        >
          {t('addStocks')} →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {displayItems.map((item, idx) => (
          <DashboardNewsCard key={`${item.ticker}-${idx}`} item={item} />
        ))}
      </motion.div>
      {isFreeTier && items.length > 3 && (
        <p className="text-xs text-[#C5A059] text-center">{t('moreNews')}</p>
      )}
    </div>
  );
}
