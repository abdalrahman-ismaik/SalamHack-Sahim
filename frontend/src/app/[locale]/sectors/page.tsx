'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function SectorExplorerPage() {
  const locale = useLocale();
  const t = useTranslations('services');

  return (
    <DashboardShell selectedTicker="AAPL">
      <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#111]/90 p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-white">{t('sector-explorer.title')}</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">{t('sector-explorer.description')}</p>
          <div className="mt-6">
            <Link
              href={`/${locale}/dashboard`}
              className="inline-flex rounded-lg border border-[#C5A059]/35 bg-[#C5A059]/10 px-4 py-2 text-sm font-medium text-[#E8D4B0] hover:bg-[#C5A059]/15"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
