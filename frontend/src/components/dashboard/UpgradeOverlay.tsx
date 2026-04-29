'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

export interface UpgradeOverlayProps {
  visible: boolean;
}

export function UpgradeOverlay({ visible }: UpgradeOverlayProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard.tier');

  if (!visible) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-10 rounded-xl bg-black/65 backdrop-blur-[1px] flex items-center justify-center p-4"
      aria-label={t('proFeature')}
    >
      <div className="text-center space-y-3">
        <p className="text-sm font-semibold text-white">{t('upgrade')}</p>
        <Link
          href={`/${locale}/pricing`}
          role="button"
          tabIndex={0}
          className="inline-flex items-center rounded-lg bg-[#C5A059] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#E8D4B0] transition-colors"
        >
          {t('proOnly')}
        </Link>
      </div>
    </div>
  );
}
