import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthQuotePanel } from '@/components/auth/AuthQuotePanel';
import FaultyTerminal from '@/components/ui/FaultyTerminal';
import type { Metadata } from 'next';

interface Props {
  params:       { locale: string };
  searchParams: { returnTo?: string; plan?: string };
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth.signUp' });
  return { title: t('title') };
}

export default function SignUpPage({ params, searchParams }: Props) {
  const t = useTranslations('auth.signUp');
  const returnTo = searchParams.returnTo ?? '';
  const plan     = searchParams.plan ?? '';
  const isAr = params.locale === 'ar';

  return (
    <main
      dir={isAr ? 'rtl' : 'ltr'}
      className="relative min-h-screen flex items-center justify-center bg-[#050505] px-4 py-12"
    >
      {/* Full-screen terminal background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <FaultyTerminal
          tint="#C5A059"
          brightness={0.35}
          scale={0.7}
          gridMul={[1.5, 0.8]}
          digitSize={1.6}
          timeScale={0.3}
          scanlineIntensity={0.5}
          glitchAmount={0.2}
          flickerAmount={0.4}
          noiseAmp={0.8}
          mouseReact={false}
          pageLoadAnimation={false}
          curvature={0}
          style={{}}
        />
      </div>

      {/* Floating container — centered, both cards visible */}
      <div className="relative z-10 flex w-full max-w-4xl items-stretch gap-6 h-[600px]">
        {/* Quote panel — desktop only, always left */}
        <div className="hidden lg:flex w-5/12 shrink-0">
          <AuthQuotePanel locale={params.locale} />
        </div>

        {/* Form card */}
        <div className="flex flex-1 flex-col">
          <div className="h-full flex flex-col rounded-2xl border border-white/15 bg-[#0a0a0a]/75 backdrop-blur-md shadow-[0_8px_48px_rgba(0,0,0,0.5)] px-6 py-8 overflow-hidden">

            {/* Brand mark + heading */}
            <div className="mb-6 shrink-0 flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/50 shadow-[0_0_24px_rgba(197,160,89,0.25)]">
                <svg className="h-6 w-6 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-white">{t('title')}</h1>
                <p className="mt-0.5 text-sm text-gray-400">{t('subtitle')}</p>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <SignUpForm returnTo={returnTo} plan={plan} />
            </div>

            <p className="mt-auto pt-4 shrink-0 text-center text-sm text-gray-500">
              {t('hasAccount')}{' '}
              <a
                href={`/${params.locale}/auth/signin${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
                className="text-[#C5A059] hover:text-[#D4B06A] font-medium transition-colors"
              >
                {t('signInLink')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

