/**
 * Data freshness label (T024).
 * Always displays: "آخر تحديث: نهاية جلسة أمس"
 * (or the localised equivalent passed via props)
 */

interface DataFreshnessLabelProps {
  label: string;
}

export function DataFreshnessLabel({ label }: DataFreshnessLabelProps) {
  return (
    <p className="text-xs text-gray-400 mt-1" aria-label={label}>
      {label}
    </p>
  );
}
