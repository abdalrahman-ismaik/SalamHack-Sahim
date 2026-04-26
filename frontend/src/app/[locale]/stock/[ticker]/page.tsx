"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getScore, ApiError } from "@/lib/api";
import type { InvestmentReadinessScore } from "@/lib/types";
import { TrafficLightBadge } from "@/components/TrafficLightBadge";
import { DataFreshnessLabel } from "@/components/DataFreshnessLabel";
import { RiskPanel } from "@/components/RiskPanel";
import { HalalPanel } from "@/components/HalalPanel";
import { NewsPanel } from "@/components/NewsPanel";
import { ArimaChart } from "@/components/ArimaChart";
import { SectorPanel } from "@/components/SectorPanel";

interface StockPageProps {
  params: {
    locale: string;
    ticker: string;
  };
}

export default function StockPage({ params }: StockPageProps) {
  const t = useTranslations();
  const ticker = params.ticker.toUpperCase();

  const [score, setScore] = useState<InvestmentReadinessScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const bandLabel: Record<string, string> = {
    green: t("score.high"),
    yellow: t("score.medium"),
    red: t("score.low"),
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{ticker}</h1>
          {score && (
            <p className="text-gray-500 text-sm">{score.name}</p>
          )}
          {/* NON-NEGOTIABLE hardcoded disclaimer — must NOT be moved to i18n */}
          <p className="mt-1 text-xs text-gray-400 italic">
            تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-400">
            جارٍ تحليل البيانات…
          </div>
        )}

        {/* Error — T027/T028 */}
        {!loading && error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        {/* Score card */}
        {!loading && score && (
          <>
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

            {/* Risk Panel (T035) */}
            <RiskPanel ticker={ticker} />

            {/* Halal Panel (T043) */}
            <HalalPanel ticker={ticker} />

            {/* News Panel (T051) */}
            <NewsPanel ticker={ticker} />

            {/* ARIMA Chart (T059) */}
            <ArimaChart ticker={ticker} />

            {/* Sector Panel (T065) */}
            <SectorPanel ticker={ticker} />
          </>
        )}
      </div>
    </main>
  );
}
