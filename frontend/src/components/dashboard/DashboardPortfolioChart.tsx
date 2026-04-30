/**
 * DashboardPortfolioChart — Doughnut chart showing sector allocation
 *
 * Displays user's portfolio allocation by sector using Chart.js Doughnut.
 * Features:
 * - Gold/accent color palette
 * - Empty state message when no sectors
 * - Skeleton loading
 * - Responsive sizing
 *
 * Props:
 *   sectors: Array<{ sector: string, value: number }> — sector data (value as %)
 *   loading?: boolean — show skeleton when true
 */

'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { PieChart } from 'lucide-react';
import { fadeInUp } from '@/lib/motion';

// Import Chart.js registry (ensures all elements registered)
import '@/lib/chartjs-registry';

export interface DashboardPortfolioChartProps {
  sectors: Array<{ sector: string; value: number }>;
  loading?: boolean;
  locale?: string;
}

export function DashboardPortfolioChart({
  sectors,
  loading = false,
  locale,
}: DashboardPortfolioChartProps) {
  const currentLocale = useLocale();
  const activeLocale = locale ?? currentLocale;
  const isRTL = activeLocale === 'ar';
  const t = useTranslations('dashboard.portfolio');

  if (loading) {
    return (
      <div className="h-[380px] animate-pulse rounded-xl border border-white/10 bg-white/[0.035] p-6">
        <div className="h-5 w-36 rounded bg-white/10" />
        <div className="mx-auto mt-8 h-56 w-56 rounded-full bg-white/10" />
      </div>
    );
  }

  if (!sectors || sectors.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex h-[380px] flex-col justify-between rounded-xl border border-white/10 bg-[#101010]/85 p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#C5A059]/25 bg-[#C5A059]/10 text-[#E8D4B0]">
            <PieChart className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
          <p className="text-sm leading-6 text-white/55">{t('empty')}</p>
        </div>
        <div />
      </motion.div>
    );
  }

  // Generate color palette: alternating gold, green, red, and grays
  const colors = [
    '#C5A059', // Gold
    '#00E676', // Green
    '#38BDF8', // Sky
    '#F97316', // Orange
    '#A78BFA', // Violet
  ];

  const chartData = {
    labels: sectors.map(s => s.sector),
    datasets: [
      {
        data: sectors.map(s => s.value),
        backgroundColor: sectors.map((_, i) => colors[i % colors.length]),
        borderColor: '#0a0a0a',
        borderWidth: 4,
        hoverBorderColor: '#C5A059',
        hoverBorderWidth: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        rtl: isRTL,
        labels: {
          color: '#9CA3AF',
          font: { size: 12, family: isRTL ? "'Cairo', 'Segoe UI', 'Arial'" : "'Segoe UI', 'Arial'" },
          padding: 12,
          usePointStyle: true,
          boxWidth: 8,
        },
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
        displayColors: true,
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.parsed}%`,
        },
      },
    },
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#101010]/90 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00E676]/40 to-transparent" />
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#00E676]/20 bg-[#00E676]/10 text-[#7CFFBA]">
          <PieChart className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <div className="relative h-[290px] min-h-[240px]" role="img" aria-label={t('title')}>
        <Doughnut data={chartData} options={chartOptions} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-10">
          <div className="text-center">
            <p className="text-3xl font-semibold text-white">{sectors.reduce((sum, item) => sum + item.value, 0)}</p>
            <p className="mt-1 text-xs text-white/45">{t('title')}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
