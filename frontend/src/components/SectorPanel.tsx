/**
 * Sector Comparison Panel — compares ticker vs sector peers (enhanced dark theme).
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSectors } from "@/lib/api";
import type { SectorComparison } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

interface SectorPanelProps {
  ticker: string;
}

function CompRow({
  label,
  ticker,
  sectorAvg,
  format = "number",
}: {
  label: string;
  ticker: number | null;
  sectorAvg: number | null;
  format?: "number" | "percent";
}) {
  if (ticker === null && sectorAvg === null) return null;

  const fmt = (v: number | null) => {
    if (v === null) return "—";
    if (format === "percent") return `${(v * 100).toFixed(1)}%`;
    return v.toFixed(2);
  };

  const diff =
    ticker !== null && sectorAvg !== null ? ticker - sectorAvg : null;
  const diffColor =
    diff === null
      ? "text-gray-600"
      : diff < 0
        ? "text-[#00E676]"
        : diff > 0
          ? "text-[#FF1744]"
          : "text-gray-500";

  return (
    <tr className="text-sm border-b border-[#2A2A2A] last:border-0">
      <td className="py-3 text-gray-400">{label}</td>
      <td className="py-3 text-center font-mono font-semibold text-white">{fmt(ticker)}</td>
      <td className="py-3 text-center font-mono text-gray-500">{fmt(sectorAvg)}</td>
      <td className={`py-3 text-center font-mono text-xs ${diffColor}`}>
        {diff !== null ? (diff >= 0 ? "+" : "") + diff.toFixed(2) : "—"}
      </td>
    </tr>
  );
}

export function SectorPanel({ ticker }: SectorPanelProps) {
  const t = useTranslations("sectors");
  const [data, setData] = useState<SectorComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSectors(ticker)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return (
    <div className="shimmer rounded-2xl h-40 animate-pulse bg-[#121212] border border-[#2A2A2A]" />
  );
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="default" className="space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {t("title")}
        </h2>
        <p className="text-xs text-gray-500 font-mono">
          {t("sector")}: <span className="text-[#C5A059]">{data.sector}</span>
          {data.stock_count > 0 && (
            <span> · {t("peers")}: {data.stock_count}</span>
          )}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="text-xs text-gray-600 border-b border-[#2A2A2A]">
                <th className="text-start pb-3 font-normal uppercase tracking-wider">{t("metric")}</th>
                <th className="text-center pb-3 font-normal uppercase tracking-wider">{t("sectorAvg")}</th>
              </tr>
            </thead>
            <tbody>
              {data.top_stocks.map((s) => (
                <tr key={s.ticker} className="text-sm border-b border-[#2A2A2A] last:border-0">
                  <td className="py-3 font-mono font-semibold text-[#C5A059]">{s.ticker}</td>
                  <td className="py-3 text-center font-mono text-white">{s.composite_score.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
