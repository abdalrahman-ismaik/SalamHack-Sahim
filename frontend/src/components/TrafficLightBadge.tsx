/**
 * Traffic light badge for Investment Readiness Score (T023).
 * Band: green=60-100 🟢, yellow=35-59 🟡, red=0-34 🔴
 */

import type { ScoreBand } from "@/lib/types";

interface TrafficLightBadgeProps {
  band: ScoreBand;
  score: number;
  lowConfidence?: boolean;
  /** Arabic label text — passed from parent via useTranslations */
  label: string;
  lowConfidenceLabel?: string;
}

const bandStyles: Record<ScoreBand, { bg: string; text: string; border: string; emoji: string }> = {
  green: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-400",
    emoji: "🟢",
  },
  yellow: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-400",
    emoji: "🟡",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-400",
    emoji: "🔴",
  },
};

export function TrafficLightBadge({
  band,
  score,
  lowConfidence = false,
  label,
  lowConfidenceLabel,
}: TrafficLightBadgeProps) {
  const styles = bandStyles[band];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${styles.bg} ${styles.text} ${styles.border} font-bold text-lg`}
        role="status"
        aria-label={`${label}: ${score}`}
      >
        <span aria-hidden="true">{styles.emoji}</span>
        <span>{Math.round(score)}</span>
        <span className="text-sm font-normal">{label}</span>
      </div>
      {lowConfidence && lowConfidenceLabel && (
        <span className="text-xs text-gray-500 italic">{lowConfidenceLabel}</span>
      )}
    </div>
  );
}
