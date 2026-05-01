'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { ComplianceChangeNotification } from '@/lib/types';

interface ComplianceNotificationBannerProps {
  notifications: ComplianceChangeNotification[];
  onDismiss:     (ticker: string) => void;
  onDismissAll:  () => void;
}

export function ComplianceNotificationBanner({
  notifications,
  onDismiss,
  onDismissAll,
}: ComplianceNotificationBannerProps) {
  const t = useTranslations('alerts');

  if (notifications.length === 0) return null;

  return (
    <div role="region" aria-label={t('title')} className="space-y-2 mb-4">
      <AnimatePresence mode="popLayout">
        {notifications.map(n => (
          <motion.div
            key={`${n.ticker}-${n.detected_at}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
          >
            <svg
              className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-amber-300">{t('notificationTitle')}</p>
              <p className="text-gray-300 mt-0.5">
                {t('notificationBody', {
                  ticker:   n.ticker,
                  previous: n.previous_status,
                  current:  n.current_status,
                })}
              </p>
              <p className="mt-1 text-xs text-amber-100/70">
                {t('disclaimer')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(n.ticker)}
              className="text-xs text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
              aria-label={t('dismiss')}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {notifications.length > 1 && (
        <button
          type="button"
          onClick={onDismissAll}
          className="text-xs text-gray-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {t('dismissAll')}
        </button>
      )}
    </div>
  );
}
