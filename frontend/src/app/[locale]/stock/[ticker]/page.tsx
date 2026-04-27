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
import { useUserTier } from "@/hooks/useUserTier";
import { useSoftGate } from "@/hooks/useSoftGate";

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

  const isGuest = tier === 'guest';

  const [score, setScore]     = useState<InvestmentReadinessScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const proSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
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
  }, [ticker, t]);

  // Soft gate: open after initial teaserData renders for guests
  const { gateOpen } = useSoftGate(!loading && !!score && isGuest);

  const bandLabel: Record<string, string> = {
    green: t("score.high"),
    yellow: t("score.medium"),
    red: t("score.low"),
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8" dir="rtl">
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
              className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm"
            >
              {error}
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                getScore(ticker).then(setScore).catch(() => setError(t("errors.generic"))).finally(() => setLoading(false));
              }}
              className="text-sm text-emerald-600 underline"
            >
              {tGate('teaserRetry')}
            </button>
          </>
        )}

        {/* Teaser for guests: TrafficLightBadge + Halal verdict + stock name + disclaimer */}
        {!loading && score && isGuest && (
          <div aria-inert={gateOpen ? "true" : undefined} ref={proSectionRef as React.RefObject<HTMLDivElement>}>
            <section
              className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-4"
              aria-labelledby="teaser-score-title"
            >
              <h1 className="text-2xl font-bold text-gray-900">{ticker}</h1>
              <p className="text-gray-500 text-sm line-clamp-2">{score.name}</p>

              <TrafficLightBadge
                band={score.band}
                score={score.composite_score}
                lowConfidence={score.low_confidence}
                label={bandLabel[score.band] ?? ""}
                lowConfidenceLabel={t("score.lowConfidence")}
              />

              {/* Halal disclaimer teaser */}
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                {tGate('halalDisclaimer')}
              </p>

              <p className="mt-1 text-xs text-gray-400 italic">
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
              <h1 className="text-2xl font-bold text-gray-900">{ticker}</h1>
              <p className="text-gray-500 text-sm line-clamp-2">{score.name}</p>
              <p className="mt-1 text-xs text-gray-400 italic">
                تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة
              </p>
            </div>

            <section
              className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-4"
              aria-labelledby="score-title"
            >
              <h2 id="score-title" className="text-lg font-semibold text-gray-700">
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
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">
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
                    <span className="text-sm text-gray-600">
                      {t(`score.components.${key}`)}
                    </span>
                    <span className="font-medium text-gray-800">
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
