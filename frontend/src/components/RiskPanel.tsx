/**
 * Risk Panel component — displays volatility, VaR, Sharpe, Beta + technicals/fundamentals.
 * Enhanced dark theme with data cards and glow effects.
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getRisk } from "@/lib/api";
import type { RiskMetrics } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

interface RiskPanelProps {
  ticker: string;
}

function MetricRow({
  label,
  value,
  format = "number",
  highlight = false,
}: {
  label: string;
  value: number | null;
  format?: "number" | "percent" | "pct2";
  highlight?: boolean;
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
    <li className="flex justify-between items-center text-sm py-2.5 border-b border-[#2A2A2A] last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className={`font-mono font-semibold ${highlight ? 'text-[#00E676]' : 'text-white'}`}>{display}</span>
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
          err?.status === 503
            ? tErrors("serviceUnavailable")
            : "—"
        );
      })
      .finally(() => setLoading(false));
  }, [ticker, tErrors]);

  if (loading) return (
    <div className="shimmer rounded-2xl h-64 animate-pulse bg-[#121212] border border-[#2A2A2A]" />
  );
  if (error || !data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="default" className="space-y-6">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {t("title")}
        </h2>

        {/* Core risk metrics */}
        <ul className="space-y-1">
          <MetricRow label={t("volatility")} value={data.volatility_annual} format="percent" />
          <MetricRow label={t("var95")} value={data.var_95} format="percent" highlight />
          <MetricRow label={t("sharpe")} value={data.sharpe_ratio} highlight />
          <MetricRow label={t("beta")} value={data.beta} />
          <li className="flex justify-between text-sm py-2.5 border-b border-[#2A2A2A]">
            <span className="text-gray-500">{t("benchmark")}</span>
            <span className="font-mono text-white">{data.benchmark}</span>
          </li>
        </ul>

        {/* Technical indicators */}
        <div>
          <h3 className="text-sm font-semibold text-[#C5A059] mb-2 uppercase tracking-wider text-xs">{t("technicals.title")}</h3>
          <ul className="space-y-1">
            <MetricRow label={t("technicals.rsi")} value={data.technicals.rsi} />
            <MetricRow label={t("technicals.macd")} value={data.technicals.macd_value} />
            <MetricRow label={t("technicals.ema20")} value={data.technicals.ema20} />
            <MetricRow label={t("technicals.sma50")} value={data.technicals.sma50} />
          </ul>
        </div>

        {/* Fundamentals */}
        <div>
          <h3 className="text-sm font-semibold text-[#C5A059] mb-2 uppercase tracking-wider text-xs">{t("fundamentals.title")}</h3>
          <ul className="space-y-1">
            <MetricRow label={t("fundamentals.peRatio")} value={data.fundamentals.pe_ratio} />
            <MetricRow label={t("fundamentals.debtEquity")} value={data.fundamentals.debt_equity} />
            <MetricRow
              label={t("fundamentals.revenueGrowth")}
              value={data.fundamentals.revenue_growth}
              format="pct2"
              highlight
            />
          </ul>
        </div>
      </Card>
    </motion.div>
  );
}
