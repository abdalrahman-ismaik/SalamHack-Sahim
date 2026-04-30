/**
 * DashboardSectorChart — Horizontal bar chart of sector performance
 *
 * Displays sector performance (% change) with green (positive) and red (negative) bars.
 * Features:
 * - Period toggle (week/month/quarter)
 * - Arabic sector names on Y-axis
 * - Responsive sizing
 *
 * Props:
 *   sectors: SectorBar[] — array of {sector, value, positive}
 *   period: 'week' | 'month' | 'quarter'
 *   onPeriodChange: (newPeriod) => void
 *   loading?: boolean
 */

'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { fadeInUp } from '@/lib/motion';
import type { SectorBar, UserTier } from '@/lib/types';

// Import Chart.js registry
import '@/lib/chartjs-registry';

export interface DashboardSectorChartProps {
  sectors: SectorBar[];
  period?: 'week' | 'month' | 'quarter';
  onPeriodChange?: (period: 'week' | 'month' | 'quarter') => void;
  loading?: boolean;
  tier?: UserTier;
  locale?: string;
}

export function DashboardSectorChart({
  sectors,
  period = 'week',
  onPeriodChange,
  loading = false,
  tier = 'guest',
  locale,
}: DashboardSectorChartProps) {
  const currentLocale = useLocale();
  const activeLocale = locale ?? currentLocale;
  const isRTL = activeLocale === 'ar';
  const t = useTranslations('dashboard.sector');
  const isFreeTier = tier === 'free' || tier === 'guest';
  const sectorRows = Array.isArray(sectors)
    ? sectors
        .filter((sector) => typeof sector?.value === 'number')
        .map((sector) => ({
          ...sector,
          positive: typeof sector.positive === 'boolean' ? sector.positive : sector.value >= 0,
        }))
        .slice(0, 7)
    : [];

  if (loading) {
    return (
      <div className="h-[360px] animate-pulse rounded-xl border border-white/10 bg-white/[0.035] p-6">
        <div className="h-5 w-36 rounded bg-white/10" />
        <div className="mt-8 space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-8 rounded bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  if (sectorRows.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex h-[360px] flex-col justify-between rounded-xl border border-white/10 bg-[#101010]/85 p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#C5A059]/25 bg-[#C5A059]/10 text-[#E8D4B0]">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <p className="mx-auto max-w-sm text-center text-sm leading-6 text-white/55">{t('empty')}</p>
        <div />
      </motion.div>
    );
  }

  const chartData = {
    labels: sectorRows.map(s => s.sector),
    datasets: [
      {
        label: t('performance'),
        data: sectorRows.map(s => s.value),
        backgroundColor: sectorRows.map(s =>
          s.positive ? 'rgba(0, 230, 118, 0.48)' : 'rgba(255, 23, 68, 0.48)'
        ),
        borderColor: sectorRows.map(s =>
          s.positive ? '#00E676' : '#FF1744'
        ),
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        rtl: isRTL,
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F3F4F6',
        bodyColor: '#D1D5DB',
        borderColor: '#C5A059',
        borderWidth: 1,
        padding: 10,
        rtl: isRTL,
        textDirection: isRTL ? 'rtl' : 'ltr',
        callbacks: {
          label: (context: any) => ` ${context.parsed.x.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        reverse: isRTL,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10, family: isRTL ? "'Cairo', 'Segoe UI', 'Arial'" : "'Segoe UI', 'Arial'" },
          callback: (value: any) => `${value}%`,
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#9CA3AF',
          font: { size: 11, family: isRTL ? "'Cairo', 'Segoe UI', 'Arial'" : "'Segoe UI', 'Arial'" },
        },
      },
    },
  };

  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'quarter') => {
    onPeriodChange?.(newPeriod);
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#101010]/90 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#38BDF8]/40 to-transparent" />
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#C5A059]">{t('performance')}</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{t('title')}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['week', 'month', 'quarter'] as const).map(p => (
            <div key={p} className="relative">
              {isFreeTier && p !== 'week' ? (
                <Link
                  href={`/${activeLocale}/pricing`}
                  role="button"
                  tabIndex={0}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-white/40 transition-colors hover:border-[#C5A059]/30 hover:text-[#E8D4B0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                >
                  {t(`period.${p}`)}
                  <span className="rounded bg-[#C5A059]/20 px-1 text-[10px] text-[#E8D4B0]">
                    {t('pro')}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => handlePeriodChange(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                    period === p
                      ? 'bg-[#C5A059] text-black shadow-[0_0_20px_rgba(197,160,89,0.18)]'
                      : 'border border-white/10 bg-white/[0.035] text-white/55 hover:bg-white/10'
                  }`}
                >
                  {t(`period.${p}`)}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="h-[260px] min-h-[220px]" role="img" aria-label={t('title')}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </motion.div>
  );
}
