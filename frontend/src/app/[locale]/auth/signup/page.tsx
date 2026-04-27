import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { SignUpForm } from '@/components/auth/SignUpForm';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string };
  searchParams: { returnTo?: string; plan?: string };
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth.signUp' });
  return { title: t('title') };
}

export default function SignUpPage({ searchParams }: Props) {
  const t = useTranslations('auth.signUp');
  const returnTo = searchParams.returnTo ?? '';
  const plan     = searchParams.plan ?? '';

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <SignUpForm returnTo={returnTo} plan={plan} />
        <p className="mt-4 text-center text-sm text-gray-600">
          {t('hasAccount')}{' '}
          <a
            href={`../signin${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            className="text-emerald-600 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          >
            {t('signInLink')}
          </a>
        </p>
      </div>
    </main>
  );
}
