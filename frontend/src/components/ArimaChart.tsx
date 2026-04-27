/**
 * ARIMA Forecast Chart — 30-day forecast with 95% CI confidence band.
 * Enhanced dark theme styling for Recharts.
 *
 * NON-NEGOTIABLE disclaimer (Principle V):
 * "هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة"
 * HARDCODED — never from i18n, never behind a toggle.
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { getArima } from "@/lib/api";
import type { ArimaForecast } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

interface ArimaChartProps {
  ticker: string;
}

// Custom tooltip for dark theme
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#121212] border border-[#2A2A2A] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-mono" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export function ArimaChart({ ticker }: ArimaChartProps) {
  const t = useTranslations("arima");
  const [data, setData] = useState<ArimaForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArima(ticker)
      .then(setData)
      .catch((err) => {
        setError(err?.message ?? "—");
      })
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return (
    <div className="shimmer rounded-2xl h-80 animate-pulse bg-[#121212] border border-[#2A2A2A]" />
  );
  if (error || !data) {
    return (
      <div className="bg-[#FFB300]/10 border border-[#FFB300]/20 text-[#FFB300] rounded-2xl p-4 text-sm">
        {t("insufficient")}
      </div>
    );
  }

  // Build chart data: combine last price + forecasts
  const chartData = data.forecast_dates.map((date, i) => ({
    date,
    forecast: data.forecast_values[i],
    ciLower: data.ci_lower[i],
    ciUpper: data.ci_upper[i],
    ciArea: [data.ci_lower[i], data.ci_upper[i]] as [number, number],
  }));

  // Prepend first known forecast as starting point
  const firstVal = data.forecast_values[0] ?? 0;
  const allData = [
    {
      date: t("today"),
      forecast: firstVal,
      ciLower: firstVal,
      ciUpper: firstVal,
      ciArea: [firstVal, firstVal] as [number, number],
    },
    ...chartData,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            {t("title")}
          </h2>
          <span className="text-xs text-gray-500 font-mono">
            ARIMA({data.order.join(",")}) · AIC: {data.aic.toFixed(1)}
          </span>
        </div>

        <div className="h-72" role="img" aria-label={t("chartAria")}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={allData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#666' }}
                tickLine={false}
                axisLine={{ stroke: '#2A2A2A' }}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#666' }}
                tickLine={false}
                axisLine={{ stroke: '#2A2A2A' }}
                width={60}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* CI shading area */}
              <Area
                type="monotone"
                dataKey="ciArea"
                fill="#00E676"
                stroke="none"
                fillOpacity={0.08}
              />
              {/* Forecast line */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#C5A059"
                strokeWidth={2}
                dot={false}
                name={t("forecastLine")}
              />
              {/* CI bounds */}
              <Line
                type="monotone"
                dataKey="ciLower"
                stroke="#00E676"
                strokeWidth={1}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="ciUpper"
                stroke="#00E676"
                strokeWidth={1}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* NON-NEGOTIABLE hardcoded ARIMA disclaimer (Principle V) */}
        <p className="text-xs text-gray-600 italic border-t border-[#2A2A2A] pt-3" dir="rtl">
          هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة
        </p>
      </Card>
    </motion.div>
  );
}
