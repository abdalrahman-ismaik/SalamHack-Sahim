'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { TickerStrip } from '@/components/TickerStrip';
import { DashboardKPICard } from '@/components/dashboard/DashboardKPICard';
import { DashboardZone } from '@/components/dashboard/DashboardZone';
import { DashboardArimaChart } from '@/components/dashboard/DashboardArimaChart';
import { DashboardPortfolioChart } from '@/components/dashboard/DashboardPortfolioChart';
import { DashboardSectorChart } from '@/components/dashboard/DashboardSectorChart';
import { DashboardRiskGauge } from '@/components/dashboard/DashboardRiskGauge';
import { DashboardNewsFeed } from '@/components/dashboard/DashboardNewsFeed';
import { ServiceCardGrid } from '@/components/dashboard/ServiceCardGrid';
import { TierBadge } from '@/components/dashboard/TierBadge';
import { DashboardUpgradeCheck } from '@/components/dashboard/DashboardUpgradeCheck';
import { DashboardAlertsBanner } from '@/components/dashboard/DashboardAlertsBanner';
import { staggerContainer } from '@/lib/motion';
import type { DashboardKPI, DashboardNewsItem, SectorBar, UserTier } from '@/lib/types';
import { motion } from 'framer-motion';

// TODO: Remove these mocks and restore live dashboard hooks after backend/Firebase stabilization.
const MOCK_TIER: UserTier = 'pro';
const MOCK_KPI: DashboardKPI = {
  watchlistCount: 12,
  halalComplianceRate: 0.83,
  riskProfile: '62',
  lastZakatDate: '2026-03-18T00:00:00Z',
  lastViewedTicker: 'AAPL',
};
const MOCK_PORTFOLIO_SECTORS = [
  { sector: 'Technology', value: 5 },
  { sector: 'Energy', value: 3 },
  { sector: 'Healthcare', value: 2 },
];
const MOCK_SECTOR_PERFORMANCE: SectorBar[] = [
  { sector: 'Technology', value: 4.2, positive: true },
  { sector: 'Banks', value: -1.4, positive: false },
  { sector: 'Energy', value: 2.6, positive: true },
  { sector: 'Healthcare', value: 1.1, positive: true },
  { sector: 'Materials', value: -0.8, positive: false },
];
const MOCK_NEWS_ITEMS: DashboardNewsItem[] = [
  {
    ticker: 'AAPL',
    headline: 'نتائج قوية للشركة تدعم النظرة الإيجابية على المدى القريب',
    source: 'Bloomberg',
    timestamp: '2026-04-30T07:30:00Z',
    url: '#',
    halalStatus: 'Halal',
  },
  {
    ticker: 'TSLA',
    headline: 'تقلبات مرتفعة بعد إعلان الإنتاج ربع السنوي',
    source: 'Reuters',
    timestamp: '2026-04-30T06:15:00Z',
    url: '#',
    halalStatus: 'PurificationRequired',
  },
  {
    ticker: 'NVDA',
    headline: 'الطلب على حلول الذكاء الاصطناعي يواصل دفع الإيرادات',
    source: 'CNBC',
    timestamp: '2026-04-29T20:40:00Z',
    url: '#',
    halalStatus: 'Halal',
  },
  {
    ticker: 'TASI',
    headline: 'مؤشر السوق السعودي يغلق على ارتفاع مدعوم بقطاع الطاقة',
    source: 'Argaam',
    timestamp: '2026-04-29T18:05:00Z',
    url: '#',
    halalStatus: 'Halal',
  },
];
const MOCK_RISK_SCORE = 62;

export default function DashboardPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('dashboard');
  const tier = MOCK_TIER;
  const kpi = MOCK_KPI;
  const kpiLoading = false;
  const portfolioSectors = MOCK_PORTFOLIO_SECTORS;
  const portfolioLoading = false;
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const sectors = MOCK_SECTOR_PERFORMANCE;
  const sectorsLoading = false;
  const newsItems = MOCK_NEWS_ITEMS;
  const newsLoading = false;

  const [selectedTicker, setSelectedTicker] = useState<string>(MOCK_KPI.lastViewedTicker ?? 'AAPL');

  // Handle ticker selection from TickerStrip
  const handleTickerClick = (symbol: string) => {
    setSelectedTicker(symbol);
  };

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#0a0a0a] ${
        isRTL ? 'font-[var(--font-arabic)] text-right' : 'font-[var(--font-latin)] text-left'
      }`}
    >
      <DashboardUpgradeCheck />
      <DashboardAlertsBanner />

      {/* Zone 1: Header + Ticker Strip */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <div className="px-4 py-6 border-b border-[#2A2A2A]">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">
                {t('greeting')}
              </h1>
              <TierBadge />
            </div>
            <p className="text-sm text-gray-400">{t('subtitle')}</p>
          </div>
        </div>

        {/* Zone 1: Scrolling Ticker Strip */}
        <DashboardZone title={t('zone1Title')}>
          <TickerStrip onTickerClick={handleTickerClick} />
        </DashboardZone>

        {/* Zone 2: KPI Cards (Grid) */}
        <div className="px-4">
          <div className="mx-auto max-w-7xl">
            <DashboardZone title={t('zone2Title')}>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardKPICard
                  label={t('kpi.watchlist')}
                  value={kpi.watchlistCount}
                  subtitle={t('kpi.watchlistSubtitle')}
                  loading={kpiLoading}
                  icon={<span>📊</span>}
                />
                <DashboardKPICard
                  label={t('kpi.compliance')}
                  value={
                    kpi.halalComplianceRate !== null
                      ? `${Math.round(kpi.halalComplianceRate * 100)}%`
                      : null
                  }
                  subtitle={t('kpi.complianceSubtitle')}
                  loading={kpiLoading}
                  icon={<span>✓</span>}
                />
                <DashboardKPICard
                  label={t('kpi.riskProfile')}
                  value={kpi.riskProfile ?? t('kpi.notComputed')}
                  subtitle={t('kpi.riskSubtitle')}
                  loading={kpiLoading}
                  cta={
                    !kpi.riskProfile
                      ? {
                          label: t('kpi.computeRisk'),
                          href: `/${locale}/tools/risk-wizard`,
                        }
                      : undefined
                  }
                  icon={<span>⚠️</span>}
                />
                <DashboardKPICard
                  label={t('kpi.zakat')}
                  value={kpi.lastZakatDate ? 'تم' : t('kpi.notSet')}
                  subtitle={t('kpi.zakatSubtitle')}
                  loading={kpiLoading}
                  cta={
                    !kpi.lastZakatDate
                      ? {
                          label: t('kpi.calculateZakat'),
                          href: `/${locale}/tools/zakat`,
                        }
                      : undefined
                  }
                  icon={<span>💰</span>}
                />
              </div>
            </DashboardZone>
          </div>
        </div>

        {/* Zone 3: Charts (ARIMA + Portfolio) */}
        <div className="px-4">
          <div className="mx-auto max-w-7xl">
            <DashboardZone title={t('zone3Title')}>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                {/* ARIMA Chart (7 cols) */}
                <div className={`lg:col-span-7 ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}>
                  <DashboardArimaChart ticker={selectedTicker} tier={tier} locale={locale} />
                </div>

                {/* Portfolio Chart (5 cols) */}
                <div className={`lg:col-span-5 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
                  <DashboardPortfolioChart sectors={portfolioSectors} loading={portfolioLoading} locale={locale} />
                </div>
              </div>
            </DashboardZone>
          </div>
        </div>

        {/* Zone 4: Service Cards */}
        <div className="px-4 pb-12">
          <div className="mx-auto max-w-7xl">
            <DashboardZone title={t('zone4Title')}>
              <ServiceCardGrid />
            </DashboardZone>
          </div>
        </div>

        {/* Zone 5: Sector Chart + Risk Gauge */}
        <div className="px-4">
          <div className="mx-auto max-w-7xl">
            <DashboardZone title={t('zone5Title')}>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                {/* Sector Chart (7 cols) */}
                <div className={`lg:col-span-7 ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}>
                  <DashboardSectorChart
                    sectors={sectors}
                    onPeriodChange={setPeriod}
                    loading={sectorsLoading}
                    tier={tier}
                    locale={locale}
                  />
                </div>

                {/* Risk Gauge (5 cols) */}
                <div className={`lg:col-span-5 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
                  <DashboardRiskGauge
                    score={MOCK_RISK_SCORE}
                    label={kpi.riskProfile || t('riskUnknown')}
                    loading={kpiLoading}
                    locale={locale}
                  />
                </div>
              </div>
            </DashboardZone>
          </div>
        </div>

        {/* Zone 6: News Feed */}
        <div className="px-4 pb-12">
          <div className="mx-auto max-w-7xl">
            <DashboardZone title={t('zone6Title')}>
              <DashboardNewsFeed items={newsItems} loading={newsLoading} tier={tier} />
            </DashboardZone>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
