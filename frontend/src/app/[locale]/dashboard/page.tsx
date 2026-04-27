import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { getUserFromCookie } from '@/lib/auth';
import { TierBadge } from '@/components/dashboard/TierBadge';
import { ServiceCardGrid } from '@/components/dashboard/ServiceCardGrid';

export default async function DashboardPage() {
  const session = await getUserFromCookie();
  const locale  = await getLocale();

  if (!session || session.tier === 'guest') {
    redirect(`/${locale}/auth/signin?returnTo=/${locale}/dashboard`);
  }

  const t = await getTranslations('dashboard');

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('greeting', { name: session.name ?? '' })}
        </h1>
        <TierBadge />
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-2">
        {t('services')}
      </h2>
      <ServiceCardGrid />
    </main>
  );
}
