'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import {
  Activity,
  Bell,
  Landmark,
  Newspaper,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GradientText } from '@/components/ui/GradientText';
import { TickerStrip } from '@/components/TickerStrip';

function FeatureShowcase() {
  const t = useTranslations('landing.hero.featureShowcase');
  const [activeIndex, setActiveIndex] = useState(0);

  const cards = [
    {
      id: 'score',
      Icon: Search,
      title: t('cards.score.title'),
      stat: '0-100',
      statLabel: t('cards.score.stat'),
      progress: 78,
      values: [34, 48, 42, 61, 55, 78, 68, 84],
      fill: 'bg-[#C5A059]',
      accent: 'text-[#C5A059]',
      border: 'border-[#C5A059]/35',
      bg: 'bg-[#C5A059]/12',
    },
    {
      id: 'halal',
      Icon: ShieldCheck,
      title: t('cards.halal.title'),
      stat: 'AAOIFI',
      statLabel: t('cards.halal.stat'),
      progress: 92,
      values: [45, 48, 56, 62, 74, 72, 86, 92],
      fill: 'bg-[#00E676]',
      accent: 'text-[#00E676]',
      border: 'border-[#00E676]/35',
      bg: 'bg-[#00E676]/12',
    },
    {
      id: 'risk',
      Icon: Activity,
      title: t('cards.risk.title'),
      stat: 'VaR',
      statLabel: t('cards.risk.stat'),
      progress: 66,
      values: [70, 64, 72, 52, 58, 46, 54, 42],
      fill: 'bg-sky-300',
      accent: 'text-sky-300',
      border: 'border-sky-300/30',
      bg: 'bg-sky-300/10',
    },
    {
      id: 'news',
      Icon: Newspaper,
      title: t('cards.news.title'),
      stat: 'AI',
      statLabel: t('cards.news.stat'),
      progress: 84,
      values: [28, 42, 52, 45, 63, 75, 68, 84],
      fill: 'bg-violet-300',
      accent: 'text-violet-300',
      border: 'border-violet-300/30',
      bg: 'bg-violet-300/10',
    },
    {
      id: 'zakat',
      Icon: Landmark,
      title: t('cards.zakat.title'),
      stat: '85g',
      statLabel: t('cards.zakat.stat'),
      progress: 58,
      values: [32, 38, 35, 44, 49, 53, 50, 58],
      fill: 'bg-emerald-300',
      accent: 'text-emerald-300',
      border: 'border-emerald-300/30',
      bg: 'bg-emerald-300/10',
    },
    {
      id: 'alerts',
      Icon: Bell,
      title: t('cards.alerts.title'),
      stat: 'Pro',
      statLabel: t('cards.alerts.stat'),
      progress: 72,
      values: [24, 32, 44, 41, 58, 66, 62, 72],
      fill: 'bg-amber-300',
      accent: 'text-amber-300',
      border: 'border-amber-300/30',
      bg: 'bg-amber-300/10',
    },
  ];

  const active = cards[activeIndex];
  const ActiveIcon = active.Icon;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % cards.length);
    }, 3800);

    return () => window.clearInterval(intervalId);
  }, [cards.length]);

  return (
    <div className="relative w-full max-w-[460px] mx-auto">
      <div className="absolute inset-0 rotate-2 rounded-[2rem] border border-white/8 bg-white/[0.025]" />
      <div className="absolute inset-0 -rotate-2 rounded-[2rem] border border-white/8 bg-white/[0.018]" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0d0d]/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

        <div key={active.id} className="hero-fade-up">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C5A059]">
                {t('kicker')}
              </p>
              <h2 className="mt-3 truncate text-xl font-bold leading-tight text-white">
                {active.title}
              </h2>
            </div>
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${active.border} ${active.bg} ${active.accent}`}>
              <ActiveIcon className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-4">
            <div className="flex h-32 items-end gap-2">
              {active.values.map((value, index) => (
                <span
                  key={`${active.id}-${value}-${index}`}
                  className={`flex-1 rounded-t-xl ${active.fill} opacity-85 transition-all duration-700`}
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric value={active.stat} label={active.statLabel} tone={active.accent} />
              <Metric value={t('metrics.fast')} label={t('metrics.fastLabel')} />
              <Metric value={t('metrics.private')} label={t('metrics.privateLabel')} />
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C5A059] via-[#F0D590] to-[#00E676] transition-all duration-700"
                style={{ width: `${active.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {cards.map((card, index) => {
            const Icon = card.Icon;
            const selected = index === activeIndex;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`group min-h-[76px] rounded-2xl border p-3 text-start transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/70 ${
                  selected
                    ? `${card.border} ${card.bg} shadow-lg shadow-black/20`
                    : 'border-white/8 bg-white/[0.035] hover:border-white/16 hover:bg-white/[0.055]'
                }`}
                aria-pressed={selected}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${selected ? card.accent : 'text-gray-500 group-hover:text-gray-300'}`} aria-hidden="true" />
                  <span className="truncate text-xs font-semibold text-white">
                    {card.title}
                  </span>
                </div>
                <div className="mt-3 flex h-8 items-end gap-1">
                  {card.values.slice(2).map((value, chartIndex) => (
                    <span
                      key={`${card.id}-mini-${chartIndex}`}
                      className={`flex-1 rounded-full ${selected ? card.fill : 'bg-white/20'} transition-all duration-500`}
                      style={{ height: `${Math.max(18, value)}%` }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3">
          <p className="truncate text-xs font-semibold text-white">{t('footerTitle')}</p>
          <span className="rounded-full border border-[#C5A059]/30 bg-[#C5A059]/12 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#F0D590]">
            {t('footerBadge')}
          </span>
        </div>
      </div>
    </div>
  );
}

function Metric({ value, label, tone = 'text-white' }: { value: string; label: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.045] p-3">
      <p className={`truncate text-base font-bold ${tone}`}>{value}</p>
      <p className="mt-1 truncate text-[10px] leading-4 text-gray-500">{label}</p>
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
              <a href={`/${locale}#try-stock`}>
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
            <FeatureShowcase />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <TickerStrip />
      </div>
    </section>
  );
}
