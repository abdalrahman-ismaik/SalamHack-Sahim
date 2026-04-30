'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Activity, Eye, Landmark, ShieldCheck } from 'lucide-react';
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
import { useDashboardKPI } from '@/hooks/useDashboardKPI';
import { useDashboardPortfolio } from '@/hooks/useDashboardPortfolio';
import { useDashboardNews } from '@/hooks/useDashboardNews';
import { useSectorPerformance } from '@/hooks/useSectorPerformance';
import { useUserTier } from '@/hooks/useUserTier';
import { useWatchlist } from '@/hooks/useWatchlist';
import { motion } from 'framer-motion';

const DEFAULT_TICKER = 'AAPL';

function normalizeComplianceRate(rate: number | null | undefined) {
  if (rate == null) return null;
  const normalized = rate <= 1 ? rate * 100 : rate;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function parseRiskScore(riskProfile: string | null | undefined) {
  if (!riskProfile) return null;
  const score = Number.parseFloat(riskProfile);
  if (!Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function daysSince(dateString: string | null | undefined) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function DashboardPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('dashboard');
  const tier = useUserTier();
  const expandedTier = tier === 'pro' || tier === 'enterprise';
  const newsLimit: 3 | 6 = expandedTier ? 6 : 3;

  const { kpi, loading: kpiLoading } = useDashboardKPI();
  const { tickers, loading: watchlistLoading } = useWatchlist();
  const { sectors: portfolioSectors, loading: portfolioLoading } = useDashboardPortfolio();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const { sectors, loading: sectorsLoading } = useSectorPerformance(period);
  const { items: newsItems, loading: newsLoading } = useDashboardNews(tickers, newsLimit);

  const [selectedTicker, setSelectedTicker] = useState<string>(DEFAULT_TICKER);
  const [tickerWasSelected, setTickerWasSelected] = useState(false);

  useEffect(() => {
    if (!expandedTier && period !== 'week') {
      setPeriod('week');
    }
  }, [expandedTier, period]);

  useEffect(() => {
    if (!tickerWasSelected && kpi.lastViewedTicker) {
      setSelectedTicker(kpi.lastViewedTicker);
    }
  }, [kpi.lastViewedTicker, tickerWasSelected]);

  const handleTickerClick = (symbol: string) => {
    setTickerWasSelected(true);
    setSelectedTicker(symbol.toUpperCase());
  };

  const complianceRate = normalizeComplianceRate(kpi.halalComplianceRate);
  const riskScore = parseRiskScore(kpi.riskProfile);
  const riskLabel = useMemo(() => {
    if (riskScore == null) return kpi.riskProfile || t('riskUnknown');
    if (riskScore <= 33) return t('risk.low');
    if (riskScore <= 66) return t('risk.moderate');
    return t('risk.high');
  }, [kpi.riskProfile, riskScore, t]);
  const zakatDays = daysSince(kpi.lastZakatDate);

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`relative min-h-screen overflow-hidden bg-[#050505] pb-12 ${
        isRTL ? 'font-[var(--font-arabic)] text-right' : 'font-[var(--font-latin)] text-left'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(197,160,89,0.09)_0%,rgba(5,5,5,0)_24rem),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_100%,72px_72px,72px_72px]" />
      <DashboardUpgradeCheck />
      <DashboardAlertsBanner />

      {/* Zone 1: Header + Ticker Strip */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative space-y-7"
      >
        {/* Header */}
        <div className="border-b border-white/10 px-4 py-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal text-white md:text-4xl">
                {t('greeting')}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-white/58">{t('subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/55 sm:block">
                {selectedTicker}
              </div>
              <TierBadge />
            </div>
          </div>
        </div>

        {/* Zone 1: Scrolling Ticker Strip */}
        <DashboardZone title={t('zone1Title')} density="edge">
          <TickerStrip onTickerClick={handleTickerClick} />
        </DashboardZone>

        {/* Zone 2: KPI Cards (Grid) */}
        <div className="px-4">
          <div className="mx-auto max-w-7xl">
            <DashboardZone title={t('zone2Title')}>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardKPICard
                  label={t('kpi.watchlist')}
                  value={kpi.watchlistCount > 0 ? kpi.watchlistCount : t('kpi.noWatchlistItems')}
                  subtitle={t('kpi.watchlistSubtitle')}
                  loading={kpiLoading || watchlistLoading}
                  icon={<Eye className="h-5 w-5" aria-hidden="true" />}
                  tone="gold"
                />
                <DashboardKPICard
                  label={t('kpi.compliance')}
                  value={complianceRate !== null ? `${complianceRate}%` : '—'}
                  subtitle={t('kpi.complianceSubtitle')}
                  loading={kpiLoading}
                  icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
                  tone="green"
                />
                <DashboardKPICard
                  label={t('kpi.riskProfile')}
                  value={riskScore !== null ? `${riskScore}/100` : (kpi.riskProfile ?? t('kpi.notCalculated'))}
                  subtitle={t('kpi.riskSubtitle')}
                  loading={kpiLoading}
                  cta={
                    riskScore === null && !kpi.riskProfile
                      ? {
                          label: t('kpi.computeRisk'),
                          href: '/tools/risk-wizard',
                        }
                      : undefined
                  }
                  icon={<Activity className="h-5 w-5" aria-hidden="true" />}
                  tone="amber"
                />
                <DashboardKPICard
                  label={t('kpi.zakat')}
                  value={zakatDays !== null ? t('kpi.daysSinceZakat', { days: zakatDays }) : t('kpi.notSet')}
                  subtitle={t('kpi.zakatSubtitle')}
                  loading={kpiLoading}
                  cta={
                    !kpi.lastZakatDate
                      ? {
                          label: t('kpi.calculateZakat'),
                          href: '/tools/zakat',
                        }
                      : undefined
                  }
                  icon={<Landmark className="h-5 w-5" aria-hidden="true" />}
                  tone="blue"
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
                    period={period}
                    onPeriodChange={setPeriod}
                    loading={sectorsLoading}
                    tier={tier}
                    locale={locale}
                  />
                </div>

                {/* Risk Gauge (5 cols) */}
                <div className={`lg:col-span-5 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
                  <DashboardRiskGauge
                    score={riskScore}
                    label={riskLabel}
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
              <DashboardNewsFeed items={newsItems} loading={watchlistLoading || newsLoading} tier={tier} />
            </DashboardZone>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
