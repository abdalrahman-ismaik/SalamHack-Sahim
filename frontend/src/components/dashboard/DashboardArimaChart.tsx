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
import { ArrowUpRight, TrendingUp } from 'lucide-react';
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
  const isFreeTier = tier === 'free' || tier === 'guest';
  const chartSeries = isFreeTier ? data.slice(0, 7) : data;
  const horizonLabel = isFreeTier ? t('days7') : t('days30');

  if (loading) {
    return (
      <div className="h-[380px] animate-pulse rounded-xl border border-white/10 bg-white/[0.035] p-6">
        <div className="h-5 w-32 rounded bg-white/10" />
        <div className="mt-8 h-64 rounded bg-white/10" />
      </div>
    );
  }

  if (error || !chartSeries || chartSeries.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex h-[380px] flex-col justify-between rounded-xl border border-white/10 bg-[#101010]/85 p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C5A059]">{ticker}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{t('title')}</h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#C5A059]/25 bg-[#C5A059]/10 text-[#E8D4B0]">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mx-auto max-w-sm text-center">
          <p className="text-sm leading-6 text-white/55">{t('empty')}</p>
        </div>
        <p className="text-xs text-white/45">{tDash('disclaimer.investmentAdvice')}</p>
      </motion.div>
    );
  }

  // Extract datasets
  const prices = chartSeries.map(d => d.price);
  const ciUpper = chartSeries.map(d => d.ci_upper);
  const ciLower = chartSeries.map(d => d.ci_lower);
  const dates = chartSeries.map(d => {
    const date = new Date(d.date);
    return Number.isNaN(date.getTime())
      ? d.date
      : date.toLocaleDateString(activeLocale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
  });

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: t('ciLower'),
        data: ciLower,
        borderColor: 'transparent',
        pointRadius: 0,
        borderWidth: 0,
        fill: false,
        tension: 0.35,
      },
      {
        label: t('ciUpper'),
        data: ciUpper,
        borderColor: 'transparent',
        backgroundColor: 'rgba(197, 160, 89, 0.13)',
        fill: '-1',
        pointRadius: 0,
        borderWidth: 0,
        tension: 0.35,
      },
      {
        // Actual price line
        label: `${ticker} ${t('price')}`,
        data: prices,
        borderColor: '#C5A059',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: '#C5A059',
        pointBorderColor: '#050505',
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
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
          color: 'rgba(255, 255, 255, 0.045)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10, family: isRTL ? "'Cairo', 'Segoe UI', 'Arial'" : "'Segoe UI', 'Arial'" },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.045)',
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
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#101010]/90 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent" />
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#C5A059]">{ticker}</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{t('forecast')}</h3>
        </div>
        <span className="rounded-full border border-[#C5A059]/25 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold text-[#E8D4B0]">
          {horizonLabel}
        </span>
      </div>
      <div className="h-[250px] min-h-[220px]" role="img" aria-label={`${ticker} ${t('title')}`}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${activeLocale}/stock/${ticker}`}
          role="button"
          tabIndex={0}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#E8D4B0] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
        >
          {t('viewFull')}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>

        {isFreeTier && (
          <Link
            href={`/${activeLocale}/pricing`}
            role="button"
            tabIndex={0}
            className="rounded-full border border-[#C5A059]/25 bg-[#C5A059]/10 px-3 py-1.5 text-xs font-semibold text-[#E8D4B0] transition-colors hover:bg-[#C5A059]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
          >
            {t('upgradeBanner')}
          </Link>
        )}
      </div>

      <p className="mt-3 text-white/40 text-xs">{tDash('disclaimer.investmentAdvice')}</p>
    </motion.div>
  );
}
