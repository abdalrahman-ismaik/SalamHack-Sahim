/**
 * Halal Panel — Shariah compliance display (T043/T044).
 *
 * NON-NEGOTIABLE: The disclaimer "التحقق النهائي من الحلية يقع على عاتق المستخدم"
 * is hardcoded and has NO dismiss control (Principle V).
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getHalal, ApiError } from "@/lib/api";
import type { HalalVerdict, HalalStatus } from "@/lib/types";

interface HalalPanelProps {
  ticker: string;
}

const statusStyles: Record<HalalStatus, { bg: string; text: string; border: string }> = {
  Halal: { bg: "bg-green-50", text: "text-green-800", border: "border-green-300" },
  PurificationRequired: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-300" },
  NonHalal: { bg: "bg-red-50", text: "text-red-800", border: "border-red-300" },
  Unknown: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
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

  if (loading) return <div className="text-gray-400 text-sm py-4 text-center">…</div>;
  if (!data) return null;

  const styles = statusStyles[data.status] ?? statusStyles.Unknown;
  const statusLabel: Record<HalalStatus, string> = {
    Halal: t("halal"),
    PurificationRequired: t("purificationRequired"),
    NonHalal: t("nonHalal"),
    Unknown: t("unknown"),
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
      <h2 className="text-base font-semibold text-gray-700">{t("title")}</h2>

      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${styles.bg} ${styles.text} ${styles.border}`}
        role="status"
      >
        <span className="font-bold text-lg">{statusLabel[data.status]}</span>
        <span className="text-xs ms-auto">
          {t("source")}: {data.source === "Musaffa" ? t("musaffa") : t("aaoifi")}
        </span>
      </div>

      {/* NON-NEGOTIABLE hardcoded disclaimer — no dismiss control (Principle V) */}
      <p className="text-xs text-gray-500 italic">
        التحقق النهائي من الحلية يقع على عاتق المستخدم
      </p>
    </section>
  );
}
