import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { SignInForm } from '@/components/auth/SignInForm';
import FaultyTerminal from '@/components/ui/FaultyTerminal';
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
    <main className="relative flex min-h-[calc(100dvh-6rem)] items-start justify-center px-4 pt-8 pb-6 overflow-y-auto">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <FaultyTerminal
          tint="#C5A059"
          brightness={0.35}
          scale={1}
          gridMul={[1.5, 0.8]}
          digitSize={1}
          timeScale={0.3}
          scanlineIntensity={0.5}
          glitchAmount={0.2}
          flickerAmount={0.4}
          noiseAmp={0.8}
          mouseReact={false}
          pageLoadAnimation={false}
          curvature={0}
        />
      </div>
      <div className="relative z-10 w-full max-w-sm">

        {/* Single unified card */}
        <div className="rounded-2xl border border-white/20 bg-[#0a0a0a]/90 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,0.7)] px-6 py-7">

          {/* Brand mark + heading */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/50 shadow-[0_0_24px_rgba(197,160,89,0.25)]">
              <svg className="h-6 w-6 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">{t('title')}</h1>
              <p className="mt-0.5 text-sm text-gray-400">{t('subtitle')}</p>
            </div>
          </div>

          <SignInForm returnTo={returnTo} />

          <p className="mt-5 text-center text-sm text-gray-500">
            {t('noAccount')}{' '}
            <a
              href={`/${params.locale}/auth/signup${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
              className="text-[#C5A059] hover:text-[#D4B06A] font-medium transition-colors"
            >
              {t('signUpLink')}
            </a>
          </p>
        </div>

      </div>
    </main>
  );
}
