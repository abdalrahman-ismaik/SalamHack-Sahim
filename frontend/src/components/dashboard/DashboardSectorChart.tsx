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

import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fadeInUp } from '@/lib/motion';
import type { SectorBar, UserTier } from '@/lib/types';

// Import Chart.js registry
import '@/lib/chartjs-registry';

export interface DashboardSectorChartProps {
  sectors: SectorBar[];
  onPeriodChange?: (period: 'week' | 'month' | 'quarter') => void;
  loading?: boolean;
  tier?: UserTier;
  locale?: string;
}

export function DashboardSectorChart({
  sectors,
  onPeriodChange,
  loading = false,
  tier = 'guest',
  locale,
}: DashboardSectorChartProps) {
  const currentLocale = useLocale();
  const activeLocale = locale ?? currentLocale;
  const isRTL = activeLocale === 'ar';
  const t = useTranslations('dashboard.sector');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const isFreeTier = tier === 'free';

  if (loading) {
    return (
      <div className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 h-64 animate-pulse" />
    );
  }

  if (!sectors || sectors.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white/5 border border-white/10 rounded-2xl p-8 h-64 flex items-center justify-center"
      >
        <p className="text-center text-gray-400 text-sm">{t('empty')}</p>
      </motion.div>
    );
  }

  const chartData = {
    labels: sectors.map(s => s.sector),
    datasets: [
      {
        label: t('performance'),
        data: sectors.map(s => s.value),
        backgroundColor: sectors.map(s =>
          s.positive ? 'rgba(0, 230, 118, 0.6)' : 'rgba(255, 23, 68, 0.6)'
        ),
        borderColor: sectors.map(s =>
          s.positive ? '#00E676' : '#FF1744'
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: true,
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
    setPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{t('title')}</h3>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map(p => (
            <div key={p} className="relative">
              {isFreeTier && p !== 'week' ? (
                <Link
                  href={`/${activeLocale}/pricing`}
                  role="button"
                  tabIndex={0}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-white/5 text-gray-500 border border-white/10"
                >
                  {t(`period.${p}`)}
                  <span className="rounded bg-[#C5A059]/20 px-1 text-[10px] text-[#C5A059]">
                    {t('pro')}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => handlePeriodChange(p)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    period === p
                      ? 'bg-[#C5A059] text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {t(`period.${p}`)}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div role="img" aria-label={t('title')}>
        <Bar data={chartData} options={chartOptions} height={200} />
      </div>
    </motion.div>
  );
}
