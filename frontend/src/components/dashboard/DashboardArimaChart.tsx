/**
 * DashboardArimaChart — ARIMA forecast line chart with confidence intervals
 *
 * Displays stock price forecast from ARIMA model with upper/lower confidence bounds.
 * Features:
 * - Chart.js Line chart with filled confidence interval
 * - Three datasets: price (line), ci_upper (area), ci_lower (area)
 * - Responsive sizing
 * - Skeleton loading state
 *
 * Props:
 *   data: ArimaChartPoint[] — array of {date, price, ci_lower, ci_upper}
 *   ticker: string — stock symbol (for chart title)
 *   loading?: boolean — show skeleton when true
 */

'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fadeInUp } from '@/lib/motion';
import { useDashboardArima } from '@/hooks/useDashboardArima';
import type { UserTier } from '@/lib/types';

// Import Chart.js registry (ensures all elements registered)
import '@/lib/chartjs-registry';

export interface DashboardArimaChartProps {
  ticker?: string;
  tier?: UserTier;
  locale?: string;
}

export function DashboardArimaChart({
  ticker = 'AAPL',
  tier = 'guest',
  locale,
}: DashboardArimaChartProps) {
  const currentLocale = useLocale();
  const activeLocale = locale ?? currentLocale;
  const isRTL = activeLocale === 'ar';
  const t = useTranslations('dashboard.arima');
  const tDash = useTranslations('dashboard');
  const { data, loading, error } = useDashboardArima(ticker);
  const isFreeTier = tier === 'free';
  const chartSeries = isFreeTier ? data.slice(0, 7) : data;

  if (loading) {
    return (
      <div className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 h-64 animate-pulse" />
    );
  }

  if (error || !chartSeries || chartSeries.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white/5 border border-white/10 rounded-2xl p-8 h-64 flex flex-col items-center justify-center"
      >
        <p className="text-center text-gray-400 text-sm">{t('empty')}</p>
      </motion.div>
    );
  }

  // Extract datasets
  const prices = chartSeries.map(d => d.price);
  const ciUpper = chartSeries.map(d => d.ci_upper);
  const ciLower = chartSeries.map(d => d.ci_lower);
  const dates = chartSeries.map(d => d.date);

  const chartData = {
    labels: dates,
    datasets: [
      {
        // Confidence interval upper band (filled)
        label: t('ciUpper'),
        data: ciUpper,
        borderColor: 'transparent',
        backgroundColor: 'rgba(197, 160, 89, 0.1)', // Gold with low opacity
        fill: true,
        pointRadius: 0,
        borderWidth: 0,
        tension: 0.3,
      },
      {
        // Confidence interval lower band (filled)
        label: t('ciLower'),
        data: ciLower,
        borderColor: 'transparent',
        backgroundColor: 'rgba(197, 160, 89, 0.1)',
        fill: false,
        pointRadius: 0,
        borderWidth: 0,
        tension: 0.3,
      },
      {
        // Actual price line
        label: `${ticker} ${t('price')}`,
        data: prices,
        borderColor: '#C5A059',
        backgroundColor: 'transparent',
        borderWidth: 3,
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#C5A059',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        rtl: isRTL,
        labels: {
          color: '#9CA3AF',
          font: { size: 11, family: isRTL ? "'Cairo', 'Segoe UI', 'Arial'" : "'Segoe UI', 'Arial'" },
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
          label: (context: any) => {
            const label = context.dataset.label || '';
            return ` ${label}: ${context.parsed.y.toFixed(2)}`;
          },
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
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10, family: isRTL ? "'Cairo', 'Segoe UI', 'Arial'" : "'Segoe UI', 'Arial'" },
          callback: (value: any) => value.toFixed(0),
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
      <h3 className="text-sm font-semibold text-white mb-4">{ticker} {t('forecast')}</h3>
      <div role="img" aria-label={`${ticker} ${t('title')}`}>
        <Line data={chartData} options={chartOptions} height={200} />
      </div>

      <div className="mt-4">
        <Link
          href={`/${activeLocale}/stock/${ticker}`}
          role="button"
          tabIndex={0}
          className="text-xs font-semibold text-[#C5A059] hover:text-[#E8D4B0] transition-colors"
        >
          {t('viewFull')}
        </Link>
      </div>

      {isFreeTier && (
        <div className="mt-4 rounded-lg border border-[#C5A059]/30 bg-[#C5A059]/10 px-3 py-2 text-xs text-[#E8D4B0] flex items-center justify-between gap-2">
          <span>{t('upgradeBanner')}</span>
          <Link href={`/${activeLocale}/pricing`} role="button" tabIndex={0} className="font-semibold text-[#C5A059] hover:text-[#E8D4B0] transition-colors">
            {t('days30')}
          </Link>
        </div>
      )}

      <p className="mt-3 text-white/40 text-xs">{tDash('disclaimer.investmentAdvice')}</p>
    </motion.div>
  );
}
