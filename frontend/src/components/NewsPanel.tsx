/**
 * News Panel — AI sentiment + analysis (T051/T052).
 *
 * NON-NEGOTIABLE: When news is unavailable, displays:
 * "تعذّر تحميل الأخبار في الوقت الحالي — يُعرض التقييم بناءً على البيانات الرياضية فقط"
 * This string is hardcoded (NOT from i18n) per Principle V.
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getNews } from "@/lib/api";
import type { NewsAnalysis } from "@/lib/types";

import { useUserTier } from "@/hooks/useUserTier";

interface NewsPanelProps {
  ticker: string;
}

type Sentiment = "positive" | "neutral" | "negative";

const sentimentStyles: Record<Sentiment, { bg: string; text: string; emoji: string }> = {
  positive: { bg: "bg-green-50 border-green-200", text: "text-green-800", emoji: "📈" },
  neutral: { bg: "bg-gray-50 border-gray-200", text: "text-gray-700", emoji: "➡️" },
  negative: { bg: "bg-red-50 border-red-200", text: "text-red-800", emoji: "📉" },
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

  if (loading) return <div className="text-gray-400 text-sm py-4 text-center">…</div>;

  // News truly unavailable — no data returned
  if (!data) {
    return (
      /* NON-NEGOTIABLE hardcoded fallback banner (Principle V) */
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-4 text-sm">
        تعذّر تحميل الأخبار في الوقت الحالي — يُعرض التقييم بناءً على البيانات الرياضية فقط
      </div>
    );
  }

  // news_unavailable flag from backend
  if (data.news_unavailable) {
    return (
      /* NON-NEGOTIABLE hardcoded fallback banner (Principle V) */
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-4 text-sm">
        تعذّر تحميل الأخبار في الوقت الحالي — يُعرض التقييم بناءً على البيانات الرياضية فقط
      </div>
    );
  }

  const s = data.sentiment as Sentiment;
  const styles = sentimentStyles[s] ?? sentimentStyles.neutral;

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-700">{t("title")}</h2>

      {/* Sentiment badge */}
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${styles.bg} ${styles.text}`}
        role="status"
      >
        <span className="text-lg">{styles.emoji}</span>
        <span>{t(`sentiment.${s}`)}</span>
      </div>

      {/* Arabic summary */}
      {data.summary_ar && (
        <p className="text-sm text-gray-700 leading-relaxed" dir="rtl">
          {data.summary_ar}
        </p>
      )}

      {/* Key risks */}
      {data.key_risks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-700 mb-1">{t("keyRisks")}</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1" dir="rtl">
            {data.key_risks.slice(0, cap).map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key opportunities */}
      {data.key_opportunities.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-green-700 mb-1">{t("keyOpportunities")}</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1" dir="rtl">
            {data.key_opportunities.slice(0, cap).map((opp, i) => (
              <li key={i}>{opp}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
