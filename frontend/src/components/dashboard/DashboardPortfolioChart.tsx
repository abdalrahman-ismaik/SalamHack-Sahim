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

  // Generate color palette: alternating gold, green, red, and grays
  const colors = [
    '#C5A059', // Gold
    '#00E676', // Green
    '#FF1744', // Red
    '#6E7A8A', // Gray
    '#7C8AA1', // Light gray
  ];

  const chartData = {
    labels: sectors.map(s => s.sector),
    datasets: [
      {
        data: sectors.map(s => s.value),
        backgroundColor: sectors.map((_, i) => colors[i % colors.length]),
        borderColor: '#0a0a0a',
        borderWidth: 2,
        hoverBorderColor: '#C5A059',
        hoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        rtl: isRTL,
        labels: {
          color: '#9CA3AF',
          font: { size: 12, family: isRTL ? "'Cairo', 'Segoe UI', 'Arial'" : "'Segoe UI', 'Arial'" },
          padding: 12,
          usePointStyle: true,
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
      className="bg-white/5 border border-white/10 rounded-2xl p-6"
    >
      <div role="img" aria-label={t('title')}>
        <Doughnut data={chartData} options={chartOptions} height={200} />
      </div>
    </motion.div>
  );
}
