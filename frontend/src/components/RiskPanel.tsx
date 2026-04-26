/**
 * Risk Panel component — displays volatility, VaR, Sharpe, Beta + technicals/fundamentals.
 * T034/T035/T036
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getRisk, ApiError } from "@/lib/api";
import type { RiskMetrics } from "@/lib/types";

interface RiskPanelProps {
  ticker: string;
}

function MetricRow({
  label,
  value,
  format = "number",
}: {
  label: string;
  value: number | null;
  format?: "number" | "percent" | "pct2";
}) {
  if (value === null) return null;
  let display: string;
  if (format === "percent") {
    display = `${(value * 100).toFixed(2)}%`;
  } else if (format === "pct2") {
    display = `${(value * 100).toFixed(2)}%`;
  } else {
    display = value.toFixed(2);
  }
  return (
    <li className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{display}</span>
    </li>
  );
}

export function RiskPanel({ ticker }: RiskPanelProps) {
  const t = useTranslations("risk");
  const tErrors = useTranslations("errors");
  const [data, setData] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getRisk(ticker)
      .then(setData)
      .catch((err) => {
        setError(
          err instanceof ApiError && err.status === 503
            ? tErrors("serviceUnavailable")
            : "—"
        );
      })
      .finally(() => setLoading(false));
  }, [ticker, tErrors]);

  if (loading) return <div className="text-gray-400 text-sm py-4 text-center">…</div>;
  if (error || !data) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
      <h2 className="text-base font-semibold text-gray-700">{t("title")}</h2>

      {/* Core risk metrics */}
      <ul>
        <MetricRow label={t("volatility")} value={data.volatility_annual} format="percent" />
        <MetricRow label={t("var95")} value={data.var_95} format="percent" />
        <MetricRow label={t("sharpe")} value={data.sharpe_ratio} />
        <MetricRow label={t("beta")} value={data.beta} />
        <li className="flex justify-between text-sm py-1 border-b border-gray-100 text-gray-500">
          <span>{t("benchmark")}</span>
          <span>{data.benchmark}</span>
        </li>
      </ul>

      {/* Technical indicators */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">{t("technicals.title")}</h3>
        <ul>
          <MetricRow label={t("technicals.rsi")} value={data.technicals.rsi} />
          <MetricRow label={t("technicals.macd")} value={data.technicals.macd_value} />
          <MetricRow label={t("technicals.ema20")} value={data.technicals.ema20} />
          <MetricRow label={t("technicals.sma50")} value={data.technicals.sma50} />
        </ul>
      </div>

      {/* Fundamentals */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">{t("fundamentals.title")}</h3>
        <ul>
          <MetricRow label={t("fundamentals.peRatio")} value={data.fundamentals.pe_ratio} />
          <MetricRow label={t("fundamentals.debtEquity")} value={data.fundamentals.debt_equity} />
          <MetricRow
            label={t("fundamentals.revenueGrowth")}
            value={data.fundamentals.revenue_growth}
            format="pct2"
          />
        </ul>
      </div>
    </section>
  );
}
