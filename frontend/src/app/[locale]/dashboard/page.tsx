import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import { TierBadge } from '@/components/dashboard/TierBadge';
import { ServiceCardGrid } from '@/components/dashboard/ServiceCardGrid';
import { DashboardUpgradeCheck } from '@/components/dashboard/DashboardUpgradeCheck';

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

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">
          {t('greeting', { name: '' })}
        </h1>
        <TierBadge />
      </div>

      <h2 className="text-lg font-semibold text-gray-300 mb-2">
        {t('services')}
      </h2>
      <ServiceCardGrid />
    </main>
  );
}
