/**
 * Budget Allocator form + results (enhanced dark theme).
 *
 * NON-NEGOTIABLE: "تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"
 * is hardcoded in JSX (Principle V).
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getAllocation } from "@/lib/api";
import type { AllocationResult } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

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
      <Card variant="default">
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("title")}
          </h2>

          <div className="space-y-2">
            <label htmlFor="budget" className="block text-sm text-gray-400">
              {t("budgetLabel")}
            </label>
            <input
              id="budget"
              type="number"
              min="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-lg bg-[#0a0a0a] border border-[#2A2A2A] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all font-mono"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tickers" className="block text-sm text-gray-400">
              {t("tickersLabel")}
            </label>
            <input
              id="tickers"
              type="text"
              placeholder={t("tickersPlaceholder")}
              value={tickersInput}
              onChange={(e) => setTickersInput(e.target.value)}
              className="w-full rounded-lg bg-[#0a0a0a] border border-[#2A2A2A] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all font-mono"
              dir="ltr"
            />
          </div>

          {error && (
            <p className="text-sm text-[#FF1744] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              {error}
            </p>
          )}

          <Button type="submit" variant="gold" className="w-full" loading={loading}>
            {t("calculate")}
          </Button>
        </form>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card variant="gold" className="space-y-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t("totalBudget")}</span>
                <span className="font-mono font-semibold text-white">{result.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t("allocated")}</span>
                <span className="font-mono font-semibold text-[#00E676]">
                  {result.total_invested.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t("remainingCash")}</span>
                <span className="font-mono font-semibold text-white">{result.leftover.toLocaleString()}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-600 border-b border-[#2A2A2A]">
                      <th className="text-start pb-3 font-normal uppercase tracking-wider">{t("ticker")}</th>
                      <th className="text-center pb-3 font-normal uppercase tracking-wider">{t("shares")}</th>
                      <th className="text-center pb-3 font-normal uppercase tracking-wider">{t("price")}</th>
                      <th className="text-center pb-3 font-normal uppercase tracking-wider">{t("cost")}</th>
                      <th className="text-center pb-3 font-normal uppercase tracking-wider">{t("weight")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.allocations.map((a) => (
                      <tr key={a.ticker} className="border-b border-[#1a1a1a] last:border-0">
                        <td className="py-3 font-semibold text-[#C5A059] font-mono">{a.ticker}</td>
                        <td className="py-3 text-center font-mono">{a.shares}</td>
                        <td className="py-3 text-center font-mono">—</td>
                        <td className="py-3 text-center font-mono">{a.cost.toLocaleString()}</td>
                        <td className="py-3 text-center font-mono text-[#00E676]">{(a.weight * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* NON-NEGOTIABLE hardcoded disclaimer (Principle V) */}
              <p className="text-xs text-gray-600 italic border-t border-[#2A2A2A] pt-3" dir="rtl">
                تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
