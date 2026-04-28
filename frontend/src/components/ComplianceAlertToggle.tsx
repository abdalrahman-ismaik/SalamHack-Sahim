'use client';

import { useTranslations } from 'next-intl';
import { useComplianceAlerts } from '@/hooks/useComplianceAlerts';
import { useState } from 'react';

interface ComplianceAlertToggleProps {
  ticker: string;
}

export function ComplianceAlertToggle({ ticker }: ComplianceAlertToggleProps) {
  const t = useTranslations('alerts');
  const { enabled, toggle, loading } = useComplianceAlerts(ticker);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<'success' | 'error' | null>(null);

  async function handleToggle() {
    setSaving(true);
    setSaveMsg(null);
    try {
      await toggle();
      setSaveMsg('success');
    } catch {
      setSaveMsg('error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }

  if (loading) return <div className="h-10 w-full animate-pulse rounded-xl bg-gray-800" />;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={saving}
        aria-pressed={enabled}
        className={`flex items-center gap-3 min-h-[44px] px-4 py-2 rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
          enabled
            ? 'bg-blue-500/15 border-blue-400/40 text-blue-300 hover:bg-blue-500/25'
            : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
        }`}
      >
        {/* Toggle icon */}
        <svg
          className="w-5 h-5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          {enabled ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.343 6.343a8 8 0 0110.607 0M3.172 3.172a16 16 0 0119.799 0M8.464 8.464a5 5 0 016.928 0M12 18h.01" />
          )}
        </svg>
        <span className="text-sm font-medium">
          {t('toggleLabel')}
        </span>
        <span className="ms-auto text-xs opacity-70">
          {enabled ? t('enabled') : t('disabled')}
        </span>
      </button>

      {/* Confirmation message */}
      {saveMsg === 'success' && (
        <p className="text-xs text-emerald-400" role="status">{t('savedSuccess')}</p>
      )}
      {saveMsg === 'error' && (
        <p className="text-xs text-rose-400" role="alert">{t('saveError')}</p>
      )}
    </div>
  );
}
