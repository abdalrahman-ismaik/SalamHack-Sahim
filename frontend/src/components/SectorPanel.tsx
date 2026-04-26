/**
 * Sector Comparison Panel — compares ticker vs sector peers (T064–T066).
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSectors } from "@/lib/api";
import type { SectorComparison } from "@/lib/types";

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
      ? ""
      : diff < 0
        ? "text-green-600"
        : diff > 0
          ? "text-red-600"
          : "text-gray-500";

  return (
    <tr className="text-sm border-b border-gray-50 last:border-0">
      <td className="py-2 text-gray-600">{label}</td>
      <td className="py-2 text-center font-medium">{fmt(ticker)}</td>
      <td className="py-2 text-center text-gray-500">{fmt(sectorAvg)}</td>
      <td className={`py-2 text-center text-xs ${diffColor}`}>
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

  if (loading) return <div className="text-gray-400 text-sm py-4 text-center">…</div>;
  if (!data) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
      <h2 className="text-base font-semibold text-gray-700">{t("title")}</h2>
      <p className="text-xs text-gray-500">
        {t("sector")}: {data.sector}
        {data.peer_tickers.length > 0 && ` · ${t("peers")}: ${data.peer_tickers.join(", ")}`}
      </p>

      <table className="w-full" role="table">
        <thead>
          <tr className="text-xs text-gray-400 border-b border-gray-100">
            <th className="text-start pb-2 font-normal">{t("metric")}</th>
            <th className="text-center pb-2 font-normal">{ticker}</th>
            <th className="text-center pb-2 font-normal">{t("sectorAvg")}</th>
            <th className="text-center pb-2 font-normal">{t("diff")}</th>
          </tr>
        </thead>
        <tbody>
          <CompRow label={t("peRatio")} ticker={data.ticker_pe} sectorAvg={data.sector_avg_pe} />
          <CompRow
            label={t("debtEquity")}
            ticker={data.ticker_debt_equity}
            sectorAvg={data.sector_avg_debt_equity}
          />
          <CompRow
            label={t("revenueGrowth")}
            ticker={data.ticker_revenue_growth}
            sectorAvg={data.sector_avg_revenue_growth}
            format="percent"
          />
        </tbody>
      </table>
    </section>
  );
}
