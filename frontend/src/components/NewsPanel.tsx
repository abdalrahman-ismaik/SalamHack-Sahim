/**
 * News Panel — AI sentiment + analysis (enhanced dark theme).
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getNews } from "@/lib/api";
import type { NewsAnalysis } from "@/lib/types";
import { useUserTier } from "@/hooks/useUserTier";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

interface NewsPanelProps {
  ticker: string;
}

type Sentiment = "positive" | "neutral" | "negative";

const sentimentStyles: Record<Sentiment, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  positive: { 
    bg: "bg-[#00E676]/10", 
    text: "text-[#00E676]", 
    border: "border-[#00E676]/30",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>,
  },
  neutral: { 
    bg: "bg-white/5", 
    text: "text-gray-400", 
    border: "border-white/10",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14"/></svg>,
  },
  negative: { 
    bg: "bg-[#FF1744]/10", 
    text: "text-[#FF1744]", 
    border: "border-[#FF1744]/30",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>,
  },
};

export function NewsPanel({ ticker }: NewsPanelProps) {
  const t    = useTranslations("news");
  const tier = useUserTier();
  const cap  = (tier === 'guest' || tier === 'free') ? 3 : Infinity;
  const [data, setData] = useState<NewsAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews(ticker)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return (
    <div className="shimmer rounded-2xl h-40 animate-pulse bg-[#121212] border border-[#2A2A2A]" />
  );

  if (!data || data.news_unavailable) {
    return (
      <div className="bg-[#FFB300]/10 border border-[#FFB300]/20 text-[#FFB300] rounded-2xl p-4 text-sm flex items-center gap-2">
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        {t('fallback')}
      </div>
    );
  }

  const s = data.sentiment as Sentiment;
  const styles = sentimentStyles[s] ?? sentimentStyles.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="default" className="space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          {t("title")}
        </h2>

        {/* Sentiment badge */}
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${styles.bg} ${styles.text} ${styles.border}`}
          role="status"
        >
          {styles.icon}
          <span>{t(`sentiment.${s}`)}</span>
        </div>

        {/* Arabic summary */}
        {data.summary_ar && (
          <p className="text-sm text-gray-400 leading-relaxed" dir="rtl">
            {data.summary_ar}
          </p>
        )}

        {/* Key risks */}
        {data.key_risks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#FF1744] mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              {t("keyRisks")}
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1.5" dir="rtl">
              {data.key_risks.slice(0, cap).map((risk, i) => (
                <li key={i}>{risk}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Key opportunities */}
        {data.key_opportunities.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#00E676] mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              {t("keyOpportunities")}
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1.5" dir="rtl">
              {data.key_opportunities.slice(0, cap).map((opp, i) => (
                <li key={i}>{opp}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
