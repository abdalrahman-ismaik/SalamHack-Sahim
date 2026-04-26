/**
 * ARIMA Forecast Chart — 30-day forecast with 95% CI confidence band.
 * T055–T060: Uses Recharts LineChart with area shading for CI.
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

interface ArimaChartProps {
  ticker: string;
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

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">…</div>;
  if (error || !data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-4 text-sm">
        {t("insufficientData")}
      </div>
    );
  }

  // Build chart data: combine last price + forecasts
  const chartData = data.dates.map((date, i) => ({
    date,
    forecast: data.forecast_prices[i],
    ciLower: data.ci_lower[i],
    ciUpper: data.ci_upper[i],
    // area is [ciLower, ciUpper] — recharts needs [base, height]
    ciArea: [data.ci_lower[i], data.ci_upper[i]] as [number, number],
  }));

  // Prepend last known price
  const allData = [
    {
      date: t("today"),
      forecast: data.last_price,
      ciLower: data.last_price,
      ciUpper: data.last_price,
      ciArea: [data.last_price, data.last_price] as [number, number],
    },
    ...chartData,
  ];

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-700">{t("title")}</h2>
      <p className="text-xs text-gray-500">
        {t("model")}: ARIMA({data.order.join(",")}) · AIC: {data.aic}
      </p>

      <div className="h-64" role="img" aria-label={t("chartAria")}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={allData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickLine={false}
              interval={6}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              width={60}
              tickFormatter={(v) => v.toFixed(2)}
            />
            <Tooltip
              formatter={(value: number) => value.toFixed(2)}
              labelFormatter={(label) => label}
            />
            {/* CI shading area */}
            <Area
              type="monotone"
              dataKey="ciArea"
              fill="#dbeafe"
              stroke="none"
              fillOpacity={0.5}
            />
            {/* Forecast line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name={t("forecastLine")}
            />
            {/* CI bounds */}
            <Line
              type="monotone"
              dataKey="ciLower"
              stroke="#93c5fd"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ciUpper"
              stroke="#93c5fd"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* NON-NEGOTIABLE hardcoded ARIMA disclaimer (Principle V) */}
      <p className="text-xs text-gray-500 italic" dir="rtl">
        هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة
      </p>
    </section>
  );
}
