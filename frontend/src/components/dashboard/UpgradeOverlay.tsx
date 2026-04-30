'use client';

import { useTranslations } from 'next-intl';

export interface UpgradeOverlayProps {
  visible: boolean;
}

export function UpgradeOverlay({ visible }: UpgradeOverlayProps) {
  const t = useTranslations('dashboard.tier');

  if (!visible) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/70 p-4 backdrop-blur-[2px]"
      aria-label={t('proFeature')}
    >
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold text-white">{t('upgrade')}</p>
        <span className="inline-flex items-center rounded-full bg-[#C5A059] px-3 py-1.5 text-xs font-semibold text-black">
          {t('proOnly')}
        </span>
      </div>
    </div>
  );
}
