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
import { ArrowUpRight, Gauge } from 'lucide-react';
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
      <div className="h-[360px] animate-pulse rounded-xl border border-white/10 bg-white/[0.035] p-6">
        <div className="h-5 w-28 rounded bg-white/10" />
        <div className="mx-auto mt-10 h-36 w-56 rounded-t-full bg-white/10" />
      </div>
    );
  }

  const hasScore = score !== null;
  const clampedScore = hasScore ? Math.max(0, Math.min(100, score)) : 0;
  const needleRotation = -90 + clampedScore * 1.8;

  const chartData = {
    labels: [t('low'), t('moderate'), t('high')],
    datasets: [
      {
        data: [33, 33, 34],
        backgroundColor: hasScore
          ? ['rgba(0, 230, 118, 0.72)', 'rgba(255, 179, 0, 0.72)', 'rgba(255, 23, 68, 0.72)']
          : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.08)'],
        borderColor: '#080808',
        borderWidth: 4,
        borderRadius: 8,
        hoverOffset: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    circumference: 180,
    rotation: -90,
    cutout: '72%',
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

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#101010]/90 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFB300]/45 to-transparent" />
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C5A059]">{t('score')}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{t('title')}</h3>
            <p className="mt-1 text-xs text-white/45">{label}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#FFB300]/25 bg-[#FFB300]/10 text-[#FFD67A]">
            <Gauge className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="relative h-[170px]" role="img" aria-label={t('title')}>
          <Doughnut data={chartData} options={chartOptions} />
          <div className="pointer-events-none absolute inset-x-8 bottom-[28px] h-px origin-center bg-white/30 transition-transform duration-500"
            style={{ transform: `rotate(${needleRotation}deg)` }}
          >
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white" />
          </div>
        </div>
        <div className="text-center">
          {hasScore ? (
            <>
              <p className="text-4xl font-semibold text-white">{clampedScore}</p>
              <p className="mt-1 text-xs text-white/45">{t('outOf100')}</p>
            </>
          ) : (
            <Link
              href={`/${activeLocale}/tools/risk-wizard`}
              role="button"
              tabIndex={0}
              className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/25 bg-[#C5A059]/10 px-4 py-2 text-sm font-semibold text-[#E8D4B0] transition-colors hover:bg-[#C5A059]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            >
              {t('discoverRisk')}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
      <p className="mt-3 text-white/40 text-xs">{tDash('disclaimer.investmentAdvice')}</p>
    </motion.div>
  );
}
