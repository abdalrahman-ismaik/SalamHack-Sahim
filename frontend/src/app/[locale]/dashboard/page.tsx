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
import { DashboardNewsStack } from '@/components/dashboard/DashboardNewsStack';
import { ServiceCardGrid } from '@/components/dashboard/ServiceCardGrid';
import { DashboardUpgradeCheck } from '@/components/dashboard/DashboardUpgradeCheck';
import { DashboardAlertsBanner } from '@/components/dashboard/DashboardAlertsBanner';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardSupportChat } from '@/components/dashboard/DashboardSupportChat';
import { DashboardOnboardingChecklist } from '@/components/dashboard/DashboardOnboardingChecklist';
import { staggerContainer } from '@/lib/motion';
import { useDashboardKPI } from '@/hooks/useDashboardKPI';
import { useDashboardPortfolio } from '@/hooks/useDashboardPortfolio';
import { useDashboardNews } from '@/hooks/useDashboardNews';
import { useSectorPerformance } from '@/hooks/useSectorPerformance';
import { useUserTier } from '@/hooks/useUserTier';
import { useWatchlist } from '@/hooks/useWatchlist';
import { motion } from 'framer-motion';
import type { SectorBar } from '@/lib/types';

const DEFAULT_TICKER = 'AAPL';
const MOCK_SECTORS: SectorBar[] = [
  { sector: 'Technology', value: 4.2, positive: true },
  { sector: 'Financials', value: 2.8, positive: true },
  { sector: 'Energy', value: -1.3, positive: false },
  { sector: 'Healthcare', value: 1.9, positive: true },
  { sector: 'Industrials', value: 0.7, positive: true },
  { sector: 'Materials', value: -0.9, positive: false },
  { sector: 'Real Estate', value: 1.1, positive: true },
];

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
  const watchlistCount = Math.max(kpi.watchlistCount, tickers.length);
  const riskScore = parseRiskScore(kpi.riskProfile);
  const riskLabel = useMemo(() => {
    if (riskScore == null) return kpi.riskProfile || t('riskUnknown');
    if (riskScore <= 33) return t('risk.low');
    if (riskScore <= 66) return t('risk.moderate');
    return t('risk.high');
  }, [kpi.riskProfile, riskScore, t]);
  const chartSectors = useMemo(
    () => (sectors.length > 0 ? sectors : MOCK_SECTORS),
    [sectors],
  );
  const zakatDays = daysSince(kpi.lastZakatDate);

  return (
    <DashboardShell selectedTicker={selectedTicker}>
      <DashboardOnboardingChecklist />
      <DashboardUpgradeCheck />
      <DashboardAlertsBanner />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-4 md:p-6"
      >
        <DashboardZone title={t('zone1Title')} density="edge">
          <div className="overflow-hidden rounded-[24px] border border-white/10">
            <TickerStrip onTickerClick={handleTickerClick} />
          </div>
        </DashboardZone>

        <div className="grid gap-5 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <DashboardNewsStack
              items={newsItems}
              loading={watchlistLoading || newsLoading}
            />
          </div>

          <div className="space-y-5 xl:col-span-8">
            <DashboardZone title={t('zone2Title')}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DashboardKPICard
                  label={t('kpi.watchlist')}
                  value={watchlistCount > 0 ? watchlistCount : t('kpi.noWatchlistItems')}
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

            <DashboardZone title={t('zone3Title')}>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                <div className={`lg:col-span-7 ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}>
                  <DashboardArimaChart ticker={selectedTicker} tier={tier} locale={locale} />
                </div>

                <div className={`lg:col-span-5 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
                  <DashboardPortfolioChart sectors={portfolioSectors} loading={portfolioLoading} locale={locale} />
                </div>
              </div>
            </DashboardZone>
          </div>
        </div>

        <DashboardZone title={t('zone4Title')}>
          <ServiceCardGrid />
        </DashboardZone>

        <DashboardZone title={t('zone5Title')}>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
            <div className={`lg:col-span-7 ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}>
              <DashboardSectorChart
                sectors={chartSectors}
                period={period}
                onPeriodChange={setPeriod}
                loading={sectorsLoading}
                tier={tier}
                locale={locale}
              />
            </div>

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

        <DashboardZone title={t('zone6Title')}>
          <DashboardNewsFeed items={newsItems} loading={watchlistLoading || newsLoading} tier={tier} />
        </DashboardZone>
      </motion.div>

      <DashboardSupportChat />
    </DashboardShell>
  );
}
