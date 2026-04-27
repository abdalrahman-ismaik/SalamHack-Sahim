/**
 * Traffic light badge for Investment Readiness Score.
 * Enhanced with dark theme styling and glow effects.
 * Band: green=60-100, yellow=35-59, red=0-34
 */

import type { ScoreBand } from "@/lib/types";
import { motion } from "framer-motion";

interface TrafficLightBadgeProps {
  rating?: ScoreBand;
  band?: ScoreBand;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  lowConfidence?: boolean;
  label?: string;
  lowConfidenceLabel?: string;
}

const bandStyles: Record<ScoreBand, { bg: string; text: string; border: string; glow: string; icon: React.ReactNode }> = {
  green: {
    bg: "bg-[#00E676]/10",
    text: "text-[#00E676]",
    border: "border-[#00E676]/40",
    glow: "shadow-[0_0_20px_rgba(0,230,118,0.2)]",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
    ),
  },
  yellow: {
    bg: "bg-[#FFB300]/10",
    text: "text-[#FFB300]",
    border: "border-[#FFB300]/40",
    glow: "shadow-[0_0_20px_rgba(255,179,0,0.15)]",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
    ),
  },
  red: {
    bg: "bg-[#FF1744]/10",
    text: "text-[#FF1744]",
    border: "border-[#FF1744]/40",
    glow: "shadow-[0_0_20px_rgba(255,23,68,0.15)]",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
    ),
  },
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-base gap-2",
  lg: "px-6 py-3 text-xl gap-2.5",
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
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`flex items-center ${sizeClasses[size]} rounded-full border-2 ${styles.bg} ${styles.text} ${styles.border} ${styles.glow} font-bold`}
        role="status"
        aria-label={label && score !== undefined ? `${label}: ${score}` : label}
      >
        {/* Status dot */}
        <span aria-hidden="true" className={resolvedBand === 'green' ? 'text-[#00E676]' : resolvedBand === 'yellow' ? 'text-[#FFB300]' : 'text-[#FF1744]'}>
          {styles.icon}
        </span>
        {score !== undefined && <span>{Math.round(score)}</span>}
        {label && <span className="text-sm font-normal opacity-80">{label}</span>}
      </motion.div>
      {lowConfidence && lowConfidenceLabel && (
        <span className="text-xs text-gray-500 italic">{lowConfidenceLabel}</span>
      )}
    </div>
  );
}
