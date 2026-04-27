import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { SignInForm } from '@/components/auth/SignInForm';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string };
  searchParams: { returnTo?: string };
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth.signIn' });
  return { title: t('title') };
}

export default function SignInPage({ params, searchParams }: Props) {
  const t = useTranslations('auth.signIn');
  const returnTo = searchParams.returnTo ?? '';

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <SignInForm returnTo={returnTo} />
        <p className="mt-4 text-center text-sm text-gray-600">
          {t('noAccount')}{' '}
          <a
            href={`/${params.locale}/auth/signup${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            className="text-emerald-600 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          >
            {t('signUpLink')}
          </a>
        </p>
      </div>
    </main>
  );
}
