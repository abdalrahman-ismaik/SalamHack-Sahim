import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import { TierBadge } from '@/components/dashboard/TierBadge';
import { ServiceCardGrid } from '@/components/dashboard/ServiceCardGrid';
import { DashboardUpgradeCheck } from '@/components/dashboard/DashboardUpgradeCheck';
import { DashboardAlertsBanner } from '@/components/dashboard/DashboardAlertsBanner';
import Link from 'next/link';

export default async function DashboardPage() {
  const locale      = await getLocale();
  const cookieStore = cookies();
  const cookieName  = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? 'auth_token';
  const authCookie  = cookieStore.get(cookieName);

  // Redirect unauthenticated visitors (middleware already handles this, but belt-and-suspenders)
  if (!authCookie) {
    redirect(`/${locale}/auth/signin?returnTo=/${locale}/dashboard`);
  }

  const t = await getTranslations('dashboard');

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Shows upgrade modal once after sign-in for free-tier users */}
      <DashboardUpgradeCheck />

      {/* T021: Compliance change alert banners */}
      <DashboardAlertsBanner />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">
          {t('greeting', { name: '' })}
        </h1>
        <TierBadge />
      </div>

      {/* T027: Zakat calculator CTA */}
      <div className="mb-6">
        <Link
          href={`/${locale}/tools/zakat`}
          className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>احسب زكاتك</span>
          <span aria-hidden="true">←</span>
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-gray-300 mb-2">
        {t('services')}
      </h2>
      <ServiceCardGrid />
    </main>
  );
}
