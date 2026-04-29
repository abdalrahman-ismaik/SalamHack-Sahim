/**
 * DashboardRiskGauge — Arc gauge showing risk level (0-100)
 *
 * Displays user's risk profile on a half-doughnut arc (green→amber→red).
 * When score is null, shows greyed-out arc with CTA to Risk Wizard.
 *
 * Props:
 *   score: number | null — risk score (0-100) or null
 *   label: string — risk label (e.g., "Moderate")
 *   loading?: boolean
 */

'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion';
import type { RiskGaugeData } from '@/lib/types';
import Link from 'next/link';

// Import Chart.js registry
import '@/lib/chartjs-registry';

export interface DashboardRiskGaugeProps {
  score: RiskGaugeData['score'];
  label: RiskGaugeData['label'];
  loading?: boolean;
  locale?: string;
}

export function DashboardRiskGauge({
  score,
  label,
  loading = false,
  locale,
}: DashboardRiskGaugeProps) {
  const t = useTranslations('dashboard.risk');
  const tDash = useTranslations('dashboard');
  const currentLocale = useLocale();
  const activeLocale = locale ?? currentLocale;
  const isRTL = activeLocale === 'ar';

  if (loading) {
    return (
      <div className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 h-64 animate-pulse" />
    );
  }

  // Calculate colors based on score
  let arcColor = '#6E7A8A'; // Default gray
  if (score !== null) {
    if (score <= 33) {
      arcColor = '#00E676'; // Green
    } else if (score <= 66) {
      arcColor = '#FFB300'; // Amber
    } else {
      arcColor = '#FF1744'; // Red
    }
  }

  const chartData = {
    labels: [t('score'), t('remaining')],
    datasets: [
      {
        data: score !== null ? [score, 100 - score] : [0, 100],
        backgroundColor: [arcColor, 'rgba(255, 255, 255, 0.05)'],
        borderColor: '#0a0a0a',
        borderWidth: 2,
        circumference: 180,
        rotation: 180,
      },
    ],
  };

  const chartOptions = {
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
        bodyFont: { family: isRTL ? "'Cairo', 'Segoe UI', 'Arial'" : "'Segoe UI', 'Arial'" },
      },
    },
  };

  if (score === null) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64 flex flex-col items-center justify-center space-y-4"
      >
        <p className="text-center text-gray-400 text-sm">{t('emptyState')}</p>
        <Link
          href={`/${activeLocale}/tools/risk-wizard`}
          role="button"
          tabIndex={0}
          className="px-4 py-2 bg-[#C5A059] text-black text-sm font-semibold rounded-lg hover:bg-[#E8D4B0] transition-colors"
        >
          {t('discoverRisk')}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-white/5 border border-white/10 rounded-2xl p-6"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{t('title')}</h3>
          <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
        <div role="img" aria-label={t('title')}>
          <Doughnut data={chartData} options={chartOptions} height={150} />
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{score}</p>
          <p className="text-xs text-gray-400 mt-1">{t('outOf100')}</p>
        </div>
      </div>
      <p className="mt-3 text-white/40 text-xs">{tDash('disclaimer.investmentAdvice')}</p>
    </motion.div>
  );
}
