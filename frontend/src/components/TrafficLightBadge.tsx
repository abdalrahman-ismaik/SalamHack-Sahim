/**
 * Traffic light badge for Investment Readiness Score.
 * Band: green=60-100 🟢, yellow=35-59 🟡, red=0-34 🔴
 */

import type { ScoreBand } from "@/lib/types";

interface TrafficLightBadgeProps {
  /** Alias for `band` — same union type. */
  rating?: ScoreBand;
  band?: ScoreBand;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  lowConfidence?: boolean;
  /** Screen-reader label (sr-only when used in teaser mode). Passed from parent via useTranslations. */
  label?: string;
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

const sizeClasses = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2 text-lg",
  lg: "px-6 py-3 text-xl",
};

export function TrafficLightBadge({
  rating,
  band,
  score,
  size = 'md',
  lowConfidence = false,
  label,
  lowConfidenceLabel,
}: TrafficLightBadgeProps) {
  const resolvedBand: ScoreBand = (rating ?? band) ?? 'red';
  const styles = bandStyles[resolvedBand];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex items-center gap-2 ${sizeClasses[size]} rounded-full border-2 ${styles.bg} ${styles.text} ${styles.border} font-bold`}
        role="status"
        aria-label={label && score !== undefined ? `${label}: ${score}` : label}
      >
        {/* Decorative colour dot — hidden from assistive technology */}
        <span aria-hidden="true">{styles.emoji}</span>
        {score !== undefined && <span>{Math.round(score)}</span>}
        {label && <span className="text-sm font-normal">{label}</span>}
      </div>
      {lowConfidence && lowConfidenceLabel && (
        <span className="text-xs text-gray-500 italic">{lowConfidenceLabel}</span>
      )}
    </div>
  );
}

