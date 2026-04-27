'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { GradientText } from '@/components/ui/GradientText';
import { TickerStrip } from '@/components/TickerStrip';

/** Decorative stock-score card mockup */
function StockScoreMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      <div className="absolute inset-0 bg-[#C5A059]/10 rounded-[2.5rem] blur-3xl scale-110 pointer-events-none" />
      <div className="relative bg-[#0d0d0d] border border-[#2A2A2A] rounded-[2rem] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Investment Score</p>
            <p className="text-lg font-bold text-white mt-0.5">
              Saudi Aramco{' '}
              <span className="text-gray-500 text-sm font-normal">2222.SR</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#00E676]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-end gap-1">
            <div className="w-3 h-10 rounded-full bg-[#00E676]" />
            <div className="w-3 h-7 rounded-full bg-[#00E676]/50" />
            <div className="w-3 h-4 rounded-full bg-[#2A2A2A]" />
          </div>
          <div>
            <p className="text-4xl font-extrabold text-[#00E676] leading-none">78</p>
            <p className="text-[10px] text-gray-500 mt-1">/ 100</p>
          </div>
          <div className="ms-auto">
            <span className="px-3 py-1.5 bg-[#00E676]/10 text-[#00E676] text-xs font-semibold rounded-full border border-[#00E676]/20">
              Halal
            </span>
          </div>
        </div>
        <div className="h-14 flex items-end gap-1 mb-5 px-1">
          {[38, 52, 44, 68, 58, 76, 70, 82, 78].map((h, i) => (
            <div key={i} className={`flex-1 rounded-sm ${i === 8 ? 'bg-[#C5A059]' : 'bg-[#2A2A2A]'}`} style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden mb-5">
          <div className="h-full w-[78%] bg-gradient-to-r from-[#C5A059] to-[#00E676] rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Risk', value: 'Low', color: 'text-[#00E676]' },
            { label: 'Sharpe', value: '1.42', color: 'text-white' },
            { label: 'Beta', value: '0.89', color: 'text-white' },
          ].map((m) => (
            <div key={m.label} className="bg-[#141414] rounded-2xl p-2.5 text-center">
              <p className={`text-sm font-semibold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -top-3 -end-3 bg-[#C5A059] text-[#050505] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg hero-float-up">
        AI-Powered
      </div>
      <div className="absolute -bottom-5 -start-5 bg-[#0d0d0d] border border-[#2A2A2A] rounded-2xl p-3 shadow-xl max-w-[165px] hero-float-down">
        <p className="text-[9px] text-gray-500 mb-1 uppercase tracking-wider">Latest News</p>
        <p className="text-xs text-white leading-relaxed line-clamp-2">Q4 earnings beat expectations by 12%</p>
        <p className="text-[10px] text-[#00E676] mt-1.5 font-medium">Positive</p>
      </div>
    </div>
  );
}

export function HeroSection() {
  const t      = useTranslations('landing.hero');
  const locale = useLocale();

  return (
    <section aria-labelledby="hero-heading" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505]/60 pointer-events-none" />
      <div className="absolute top-1/4 -start-32 w-[500px] h-[500px] bg-[#C5A059]/12 rounded-full blur-[120px] pointer-events-none z-[1]" />
      <div className="absolute bottom-1/4 -end-32 w-[400px] h-[400px] bg-[#00E676]/10 rounded-full blur-[100px] pointer-events-none z-[1]" />
      <div className="absolute inset-0 grid-pattern pointer-events-none z-[1]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col">
            <div className="hero-fade-up inline-flex items-center gap-2 self-start mb-6 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full" style={{ animationDelay: '0ms' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-[11px] text-gray-400 font-medium tracking-widest uppercase">{t('badge')}</span>
            </div>
            <div className="hero-fade-up mb-4" style={{ animationDelay: '80ms' }}>
              <GradientText className="text-6xl font-extrabold leading-none tracking-tight" colors={['#C5A059', '#F0D590', '#ffffff', '#F0D590', '#C5A059']} animationSpeed={6}>
                <span dir={locale === 'ar' ? 'rtl' : 'ltr'}>{locale === 'ar' ? 'سهم' : '$ahim'}</span>
              </GradientText>
            </div>
            <h1 id="hero-heading" className="hero-fade-up text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight" style={{ animationDelay: '160ms' }}>
              {t('headline')}
            </h1>
            <p className="hero-fade-up mt-5 text-base sm:text-lg text-gray-400 leading-relaxed max-w-lg" style={{ animationDelay: '240ms' }}>
              {t('subheadline')}
            </p>
            <div className="hero-fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: '320ms' }}>
              <a href={`/${locale}/stock`}>
                <Button variant="gold" size="lg">{t('cta')}</Button>
              </a>
              <a href={`/${locale}#pricing`}>
                <Button variant="outline" size="lg" className="border-white/15 text-gray-300 hover:bg-white/5 hover:text-white">
                  {t('ctaSecondary')}
                </Button>
              </a>
            </div>
            <div className="hero-fade-up mt-10 flex gap-8" style={{ animationDelay: '400ms' }}>
              {[
                { value: '50K+', label: t('statUsers') },
                { value: '12',   label: t('statMarkets') },
                { value: '99.9%', label: t('statUptime') },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-[#C5A059]">{stat.value}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-fade-up hidden lg:flex justify-center items-center" style={{ animationDelay: '250ms' }}>
            <StockScoreMockup />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <TickerStrip />
      </div>
    </section>
  );
}
