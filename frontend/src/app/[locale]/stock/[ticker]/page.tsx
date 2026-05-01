"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { getScore, ApiError } from "@/lib/api";
import type { InvestmentReadinessScore } from "@/lib/types";
import { TrafficLightBadge } from "@/components/TrafficLightBadge";
import { DataFreshnessLabel } from "@/components/DataFreshnessLabel";
import { RiskPanel } from "@/components/RiskPanel";
import { HalalPanel } from "@/components/HalalPanel";
import { NewsPanel } from "@/components/NewsPanel";
import { ArimaChart } from "@/components/ArimaChart";
import { SectorPanel } from "@/components/SectorPanel";
import { UpgradeGate } from "@/components/ui/UpgradeGate";
import { SignInGateModal } from "@/components/ui/SignInGateModal";
import { ComplianceAlertToggle } from "@/components/ComplianceAlertToggle";
import { useUserTier } from "@/hooks/useUserTier";
import { useSoftGate } from "@/hooks/useSoftGate";
import { useLastViewedTicker } from "@/hooks/useLastViewedTicker";
import { useWatchlist } from "@/hooks/useWatchlist";

interface StockPageProps {
  params: {
    locale: string;
    ticker: string;
  };
}

export default function StockPage({ params }: StockPageProps) {
  const t       = useTranslations();
  const tGate   = useTranslations('gate');
  const ticker  = params.ticker.toUpperCase();
  const tier    = useUserTier();
  const locale  = useLocale();
  const pathname = usePathname();
  const { setTicker: setLastViewedTicker } = useLastViewedTicker();
  const { tickers, saveTicker, removeTicker } = useWatchlist();

  const isGuest = tier === 'guest';
  const isInWatchlist = tickers.includes(ticker);

  const [score, setScore]     = useState<InvestmentReadinessScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [watchlistSaving, setWatchlistSaving] = useState(false);

  const proSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setLastViewedTicker(ticker);
    getScore(ticker)
      .then(setScore)
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.status === 422) {
            setError(t("errors.invalidTicker"));
          } else if (err.status === 503 || err.status === 404) {
            setError(t("errors.serviceUnavailable"));
          } else {
            setError(t("errors.generic"));
          }
        } else {
          setError(t("errors.serviceUnavailable"));
        }
      })
      .finally(() => setLoading(false));
  }, [ticker, t, setLastViewedTicker]);

  // Soft gate: open after initial teaserData renders for guests
  const { gateOpen } = useSoftGate(!loading && !!score && isGuest);

  const bandLabel: Record<string, string> = {
    green: t("score.high"),
    yellow: t("score.medium"),
    red: t("score.low"),
  };

  async function toggleWatchlist() {
    if (!score) return;

    setWatchlistSaving(true);
    try {
      if (isInWatchlist) {
        await removeTicker(ticker);
      } else {
        await saveTicker(ticker, { name: score.name });
      }
    } finally {
      setWatchlistSaving(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-400">
            جارٍ تحليل البيانات…
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <>
            <div
              role="alert"
              className="bg-[#FF1744]/10 border border-[#FF1744]/30 rounded-xl p-4 text-[#FF1744] text-sm"
            >
              {error}
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                getScore(ticker).then(setScore).catch(() => setError(t("errors.generic"))).finally(() => setLoading(false));
              }}
              className="text-sm text-[#00E676] underline"
            >
              {tGate('teaserRetry')}
            </button>
          </>
        )}

        {/* Teaser for guests: TrafficLightBadge + Halal verdict + stock name + disclaimer */}
        {!loading && score && isGuest && (
          <div aria-inert={gateOpen ? "true" : undefined} ref={proSectionRef as React.RefObject<HTMLDivElement>}>
            <section
              className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 flex flex-col items-center gap-4"
              aria-labelledby="teaser-score-title"
            >
              <h1 className="text-2xl font-bold text-white">{ticker}</h1>
              <p className="text-gray-400 text-sm line-clamp-2">{score.name}</p>

              <TrafficLightBadge
                band={score.band}
                score={score.composite_score}
                lowConfidence={score.low_confidence}
                label={bandLabel[score.band] ?? ""}
                lowConfidenceLabel={t("score.lowConfidence")}
              />

              {/* Halal disclaimer teaser */}
              <p className="text-xs text-[#FFB300] bg-[#FFB300]/10 border border-[#FFB300]/20 rounded-lg px-3 py-2 text-center">
                {tGate('halalDisclaimer')}
              </p>

              <p className="mt-1 text-xs text-gray-600 italic">
                تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة
              </p>
            </section>
          </div>
        )}

        {/* Full content for authenticated users */}
        {!loading && score && !isGuest && (
          <>
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-white">{ticker}</h1>
              <p className="text-gray-400 text-sm line-clamp-2">{score.name}</p>
              <p className="mt-1 text-xs text-gray-600 italic">
                تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={toggleWatchlist}
                disabled={watchlistSaving}
                className="min-h-[44px] rounded-xl border border-[#C5A059]/35 bg-[#C5A059]/12 px-4 py-2 text-sm font-semibold text-[#F0D590] transition-colors hover:bg-[#C5A059]/20 disabled:cursor-wait disabled:opacity-65"
              >
                {isInWatchlist
                  ? (locale === 'ar' ? 'إزالة من المتابعة' : 'Remove from watchlist')
                  : (locale === 'ar' ? 'حفظ في المتابعة' : 'Save to watchlist')}
              </button>
              <ComplianceAlertToggle ticker={ticker} />
            </div>

            <section
              className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 flex flex-col items-center gap-4"
              aria-labelledby="score-title"
            >
              <h2 id="score-title" className="text-lg font-semibold text-white">
                {t("score.title")}
              </h2>

              <TrafficLightBadge
                band={score.band}
                score={score.composite_score}
                lowConfidence={score.low_confidence}
                label={bandLabel[score.band] ?? ""}
                lowConfidenceLabel={t("score.lowConfidence")}
              />

              <DataFreshnessLabel label={t("freshness.label")} />
            </section>

            {/* Score components breakdown */}
            <section className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-4">
                مكونات المؤشر
              </h2>
              <ul className="space-y-2">
                {(
                  [
                    ["volatility", score.components.volatility_score],
                    ["var", score.components.var_score],
                    ["sharpe", score.components.sharpe_score],
                    ["beta", score.components.beta_score],
                    ["sentiment", score.components.sentiment_score],
                  ] as [string, number][]
                ).map(([key, val]) => (
                  <li key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {t(`score.components.${key}`)}
                    </span>
                    <span className="font-medium text-white">
                      {Math.round(val)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <UpgradeGate requiredTier="pro" featureKey="risk">
              <RiskPanel ticker={ticker} />
            </UpgradeGate>

            <HalalPanel ticker={ticker} />

            <NewsPanel ticker={ticker} />

            <UpgradeGate requiredTier="pro" featureKey="arima">
              <ArimaChart ticker={ticker} />
            </UpgradeGate>

            <UpgradeGate requiredTier="pro" featureKey="sector">
              <SectorPanel ticker={ticker} />
            </UpgradeGate>
          </>
        )}
      </div>

      {/* Sign-in gate modal for guests */}
      {isGuest && (
        <SignInGateModal
          isOpen={gateOpen}
          returnTo={pathname}
        />
      )}
    </main>
  );
}
