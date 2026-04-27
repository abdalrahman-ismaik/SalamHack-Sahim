/**
 * Halal Panel — Shariah compliance display (enhanced dark theme).
 *
 * NON-NEGOTIABLE: The disclaimer "التحقق النهائي من الحلية يقع على عاتق المستخدم"
 * is hardcoded and has NO dismiss control (Principle V).
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getHalal } from "@/lib/api";
import type { HalalVerdict, HalalStatus } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

interface HalalPanelProps {
  ticker: string;
}

const statusStyles: Record<HalalStatus, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  Halal: { 
    bg: "bg-[#00E676]/10", 
    text: "text-[#00E676]", 
    border: "border-[#00E676]/30",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>,
  },
  PurificationRequired: { 
    bg: "bg-[#FFB300]/10", 
    text: "text-[#FFB300]", 
    border: "border-[#FFB300]/30",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
  },
  NonHalal: { 
    bg: "bg-[#FF1744]/10", 
    text: "text-[#FF1744]", 
    border: "border-[#FF1744]/30",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>,
  },
  Unknown: { 
    bg: "bg-white/5", 
    text: "text-gray-400", 
    border: "border-white/10",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
};

export function HalalPanel({ ticker }: HalalPanelProps) {
  const t = useTranslations("halal");
  const [data, setData] = useState<HalalVerdict | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHalal(ticker)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return (
    <div className="shimmer rounded-2xl h-32 animate-pulse bg-[#121212] border border-[#2A2A2A]" />
  );
  if (!data) return null;

  const styles = statusStyles[data.status] ?? statusStyles.Unknown;
  const statusLabel: Record<HalalStatus, string> = {
    Halal: t("halal"),
    PurificationRequired: t("purificationRequired"),
    NonHalal: t("nonHalal"),
    Unknown: t("unknown"),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="default" className="space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t("title")}
        </h2>

        <div
          className={`flex items-center gap-3 px-4 py-4 rounded-xl border ${styles.bg} ${styles.text} ${styles.border}`}
          role="status"
        >
          {styles.icon}
          <span className="font-bold text-lg">{statusLabel[data.status]}</span>
          <span className="text-xs ms-auto opacity-70">
            {t("source")}: {data.source === "Musaffa" ? t("musaffa") : t("aaoifi")}
          </span>
        </div>

        {/* NON-NEGOTIABLE hardcoded disclaimer — no dismiss control (Principle V) */}
        <p className="text-xs text-gray-600 italic border-t border-[#2A2A2A] pt-3" dir="rtl">
          التحقق النهائي من الحلية يقع على عاتق المستخدم
        </p>
      </Card>
    </motion.div>
  );
}
