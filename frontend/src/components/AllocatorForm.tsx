/**
 * Budget Allocator form + results (T071/T072).
 *
 * NON-NEGOTIABLE: "تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"
 * is hardcoded in JSX (Principle V).
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getAllocation } from "@/lib/api";
import type { AllocationResult } from "@/lib/types";

export function AllocatorForm() {
  const t = useTranslations("allocator");
  const [budget, setBudget] = useState<string>("10000");
  const [tickersInput, setTickersInput] = useState<string>("");
  const [result, setResult] = useState<AllocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const tickers = tickersInput
      .toUpperCase()
      .split(/[\s,،]+/)
      .filter(Boolean);

    if (tickers.length === 0) {
      setError(t("noTickers"));
      return;
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setError(t("invalidBudget"));
      return;
    }

    setLoading(true);
    try {
      const data = await getAllocation({ budget: budgetNum, tickers });
      setResult(data);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-700">{t("title")}</h2>

        <div className="space-y-1">
          <label htmlFor="budget" className="block text-sm text-gray-600">
            {t("budgetLabel")}
          </label>
          <input
            id="budget"
            type="number"
            min="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            dir="ltr"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="tickers" className="block text-sm text-gray-600">
            {t("tickersLabel")}
          </label>
          <input
            id="tickers"
            type="text"
            placeholder={t("tickersPlaceholder")}
            value={tickersInput}
            onChange={(e) => setTickersInput(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            dir="ltr"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "…" : t("calculate")}
        </button>
      </form>

      {result && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t("totalBudget")}</span>
            <span className="font-medium">{result.budget.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t("allocated")}</span>
            <span className="font-medium text-green-700">
              {result.allocated_total.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t("remainingCash")}</span>
            <span className="font-medium">{result.remaining_cash.toLocaleString()}</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-start pb-2 font-normal">{t("ticker")}</th>
                <th className="text-center pb-2 font-normal">{t("shares")}</th>
                <th className="text-center pb-2 font-normal">{t("price")}</th>
                <th className="text-center pb-2 font-normal">{t("cost")}</th>
                <th className="text-center pb-2 font-normal">{t("weight")}</th>
              </tr>
            </thead>
            <tbody>
              {result.allocations.map((a) => (
                <tr key={a.ticker} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 font-medium text-blue-700">{a.ticker}</td>
                  <td className="py-2 text-center">{a.shares}</td>
                  <td className="py-2 text-center">{a.price_per_share.toFixed(2)}</td>
                  <td className="py-2 text-center">{a.total_cost.toLocaleString()}</td>
                  <td className="py-2 text-center">{(a.weight * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* NON-NEGOTIABLE hardcoded disclaimer (Principle V) */}
          <p className="text-xs text-gray-500 italic" dir="rtl">
            تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة
          </p>
        </div>
      )}
    </div>
  );
}
