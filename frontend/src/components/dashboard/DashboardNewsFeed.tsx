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
import { ArrowUpRight, Newspaper } from 'lucide-react';

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
  const isFreeTier = tier === 'free' || tier === 'guest';
  const displayItems = isFreeTier ? items.slice(0, 3) : items;

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl border border-white/10 bg-white/[0.035]" />
        ))}
      </div>
    );
  }

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#101010]/85 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#C5A059]/25 bg-[#C5A059]/10 text-[#E8D4B0]">
          <Newspaper className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm text-white/55">{t('empty')}</p>
        <Link
          href={`/${locale}/stock`}
          role="button"
          tabIndex={0}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#C5A059]/25 bg-[#C5A059]/10 px-4 py-2 text-sm font-semibold text-[#E8D4B0] transition-colors hover:bg-[#C5A059]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
        >
          {t('addStocks')}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
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
      {isFreeTier && displayItems.length > 0 && (
        <p className="rounded-full border border-[#C5A059]/20 bg-[#C5A059]/10 px-3 py-2 text-center text-xs font-semibold text-[#E8D4B0]">{t('moreNews')}</p>
      )}
    </div>
  );
}
