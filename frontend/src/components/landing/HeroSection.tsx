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
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GradientText } from '@/components/ui/GradientText';
import { TickerStrip } from '@/components/TickerStrip';

type ChartKind = 'bars' | 'ring' | 'line' | 'sentiment' | 'stack' | 'pulse';

type FeatureCard = {
  id: string;
  Icon: LucideIcon;
  title: string;
  progress: number;
  values: number[];
  chart: ChartKind;
  color: string;
  fill: string;
  accent: string;
  border: string;
  bg: string;
};

const CARD_ROTATION_MS = 3000;
const CARD_TRANSITION_MS = 2600;

function FeatureShowcase() {
  const t = useTranslations('landing.hero.featureShowcase');
  const [activeIndex, setActiveIndex] = useState(0);
  const [stackDirection, setStackDirection] = useState<'right' | 'left'>('right');

  const cards: FeatureCard[] = [
    {
      id: 'score',
      Icon: Search,
      title: t('cards.score.title'),
      progress: 78,
      values: [34, 48, 42, 61, 55, 78, 68, 84],
      chart: 'bars',
      color: '#C5A059',
      fill: 'bg-[#C5A059]',
      accent: 'text-[#C5A059]',
      border: 'border-[#C5A059]/35',
      bg: 'bg-[#C5A059]/12',
    },
    {
      id: 'halal',
      Icon: ShieldCheck,
      title: t('cards.halal.title'),
      progress: 92,
      values: [45, 48, 56, 62, 74, 72, 86, 92],
      chart: 'ring',
      color: '#00E676',
      fill: 'bg-[#00E676]',
      accent: 'text-[#00E676]',
      border: 'border-[#00E676]/35',
      bg: 'bg-[#00E676]/12',
    },
    {
      id: 'risk',
      Icon: Activity,
      title: t('cards.risk.title'),
      progress: 66,
      values: [70, 64, 72, 52, 58, 46, 54, 42],
      chart: 'line',
      color: '#7dd3fc',
      fill: 'bg-sky-300',
      accent: 'text-sky-300',
      border: 'border-sky-300/30',
      bg: 'bg-sky-300/10',
    },
    {
      id: 'news',
      Icon: Newspaper,
      title: t('cards.news.title'),
      progress: 84,
      values: [28, 42, 52, 45, 63, 75, 68, 84],
      chart: 'sentiment',
      color: '#c4b5fd',
      fill: 'bg-violet-300',
      accent: 'text-violet-300',
      border: 'border-violet-300/30',
      bg: 'bg-violet-300/10',
    },
    {
      id: 'zakat',
      Icon: Landmark,
      title: t('cards.zakat.title'),
      progress: 58,
      values: [32, 38, 35, 44, 49, 53, 50, 58],
      chart: 'stack',
      color: '#6ee7b7',
      fill: 'bg-emerald-300',
      accent: 'text-emerald-300',
      border: 'border-emerald-300/30',
      bg: 'bg-emerald-300/10',
    },
    {
      id: 'alerts',
      Icon: Bell,
      title: t('cards.alerts.title'),
      progress: 72,
      values: [24, 32, 44, 41, 58, 66, 62, 72],
      chart: 'pulse',
      color: '#fcd34d',
      fill: 'bg-amber-300',
      accent: 'text-amber-300',
      border: 'border-amber-300/30',
      bg: 'bg-amber-300/10',
    },
  ];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % cards.length);
      setStackDirection(current => (current === 'right' ? 'left' : 'right'));
    }, CARD_ROTATION_MS);

    return () => window.clearInterval(intervalId);
  }, [cards.length]);

  function showCard(index: number) {
    if (index === activeIndex) return;

    const forwardDistance = (index - activeIndex + cards.length) % cards.length;
    const backwardDistance = (activeIndex - index + cards.length) % cards.length;
    setStackDirection(forwardDistance <= backwardDistance ? 'right' : 'left');
    setActiveIndex(index);
  }

  return (
    <div className="relative mx-auto h-[350px] w-full max-w-[430px]">
      <div className="absolute inset-x-8 bottom-3 h-10 rounded-full bg-black/40 blur-2xl" />

      {cards.map((card, index) => {
        const Icon = card.Icon;
        const offset = (index - activeIndex + cards.length) % cards.length;
        const isVisible = offset <= 2;
        const isFront = offset === 0;
        const transform =
          offset === 0
            ? 'translate3d(0, 0, 0) rotate(0deg) scale(1)'
            : offset === 1
              ? `translate3d(${stackDirection === 'right' ? '20px' : '-20px'}, 32px, 0) rotate(${stackDirection === 'right' ? '4deg' : '-4deg'}) scale(0.94)`
              : offset === 2
                ? `translate3d(${stackDirection === 'right' ? '-20px' : '20px'}, 64px, 0) rotate(${stackDirection === 'right' ? '-4deg' : '4deg'}) scale(0.88)`
                : 'translate3d(0, 96px, 0) rotate(0deg) scale(0.82)';

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => showCard(index)}
            onFocus={() => showCard(index)}
            onMouseEnter={() => showCard(index)}
            className={`group absolute inset-x-0 top-0 h-[286px] overflow-hidden rounded-[2rem] border p-5 text-start shadow-2xl transition-all duration-[2600ms] ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/70 ${
              isFront
                ? card.border
                : 'border-white/10'
            }`}
            style={{
              transform,
              zIndex: isFront ? 30 : 20 - offset,
              opacity: isVisible ? 1 : 0,
              filter: isFront ? 'brightness(1)' : 'brightness(0.62) saturate(0.86)',
              pointerEvents: isVisible ? 'auto' : 'none',
              background: isFront
                ? `linear-gradient(145deg, ${hexToRgba(card.color, 0.24)}, rgba(13,13,13,0.99) 34%, rgba(5,5,5,1) 100%)`
                : 'linear-gradient(145deg, rgb(18,18,18), rgb(7,7,7))',
              boxShadow: isFront
                ? `0 26px 76px rgba(0,0,0,0.58), 0 0 48px ${hexToRgba(card.color, 0.18)}`
                : '0 18px 48px rgba(0,0,0,0.48)',
              transition:
                `transform ${CARD_TRANSITION_MS}ms cubic-bezier(0.16, 1, 0.3, 1), opacity 1800ms ease, filter ${CARD_TRANSITION_MS}ms ease, box-shadow ${CARD_TRANSITION_MS}ms ease`,
              willChange: 'transform, opacity, filter',
            }}
            aria-label={card.title}
            aria-pressed={isFront}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),transparent_42%,rgba(255,255,255,0.035))]" />
            {isFront && (
              <span
                key={`${card.id}-shine`}
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                style={{ animation: 'hero-card-shine 900ms ease-out forwards' }}
              />
            )}

            <div className="relative flex items-center justify-between gap-4">
              <span className="truncate text-lg font-bold text-white">
                {card.title}
              </span>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${card.border} ${card.bg} ${card.accent}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <div className="relative mt-6 h-[178px] overflow-hidden rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:24px_24px]" />
              <FeatureVisual card={card} selected={isFront} large />
            </div>

          </button>
        );
      })}

      <div className="absolute bottom-0 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {cards.map((card, index) => (
          <button
            key={`${card.id}-dot`}
            type="button"
            onClick={() => showCard(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'w-7 bg-[#C5A059]' : 'w-1.5 bg-white/25 hover:bg-white/45'
            }`}
            aria-label={card.title}
            aria-pressed={index === activeIndex}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureVisual({ card, selected, large = false }: { card: FeatureCard; selected: boolean; large?: boolean }) {
  const opacity = selected ? 'opacity-100' : 'opacity-70 group-hover:opacity-90';
  const height = large ? 'h-full' : 'h-16';

  if (card.chart === 'ring') {
    return (
      <div className={`relative flex ${height} items-center justify-center ${opacity} transition-opacity`}>
        <div
          className="absolute h-32 w-32 rounded-full opacity-15 blur-xl"
          style={{ backgroundColor: card.color }}
        />
        <div
          className="relative h-32 w-32 rounded-full p-2 shadow-[0_0_38px_rgba(0,230,118,0.16)]"
          style={{
            background: `conic-gradient(${card.color} ${card.progress}%, rgba(255,255,255,0.12) 0)`,
          }}
        >
          <div className="absolute inset-5 rounded-full border border-white/10 bg-[#0d0d0d]" />
          <div
            className="absolute inset-9 rounded-full"
            style={{
              background: `conic-gradient(rgba(255,255,255,0.16) 55%, ${card.color} 0 84%, rgba(255,255,255,0.07) 0)`,
            }}
          />
          <div className="absolute inset-[52px] rounded-full bg-white" style={{ backgroundColor: card.color }} />
        </div>
      </div>
    );
  }

  if (card.chart === 'line') {
    return (
      <svg className={`relative z-10 h-full w-full ${opacity} transition-opacity`} viewBox="0 0 100 80" role="img" aria-hidden="true">
        <defs>
          <linearGradient id={`${card.id}-area`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={card.color} stopOpacity="0.42" />
            <stop offset="100%" stopColor={card.color} stopOpacity="0" />
          </linearGradient>
          <filter id={`${card.id}-glow`}>
            <feGaussianBlur stdDeviation="2.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[18, 38, 58].map(y => (
          <line key={`${card.id}-grid-${y}`} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        ))}
        <polygon points={areaPoints(card.values)} fill={`url(#${card.id}-area)`} />
        <polyline points={sparklinePoints(card.values)} fill="none" stroke={card.color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" filter={`url(#${card.id}-glow)`} />
        {card.values.slice(-3).map((value, index) => (
          <circle
            key={`${card.id}-point-${index}`}
            cx={70 + index * 12}
            cy={64 - value * 0.62}
            r={selected ? 3 : 2}
            fill={card.color}
          />
        ))}
      </svg>
    );
  }

  if (card.chart === 'sentiment') {
    return (
      <div className={`relative z-10 grid h-full grid-cols-3 items-end gap-3 ${opacity} transition-opacity`}>
        {['bg-[#FF1744]', 'bg-[#C5A059]', 'bg-[#00E676]'].map((tone, index) => (
          <span key={tone} className="relative flex h-full items-end rounded-2xl border border-white/8 bg-white/[0.055] p-2">
            <span
              className={`w-full rounded-xl ${tone} shadow-[0_0_24px_rgba(197,160,89,0.18)]`}
              style={{ height: `${[38, 62, 90][index]}%` }}
            />
            <span className={`absolute left-1/2 top-3 h-2 w-2 -translate-x-1/2 rounded-full ${tone}`} />
          </span>
        ))}
      </div>
    );
  }

  if (card.chart === 'stack') {
    return (
      <div className={`relative z-10 flex h-full flex-col justify-center gap-4 ${opacity} transition-opacity`}>
        {card.values.slice(2, 6).map((value, index) => (
          <span key={`${card.id}-stack-${index}`} className="relative block h-4 overflow-hidden rounded-full border border-white/8 bg-white/[0.08]">
            <span
              className="block h-full rounded-full"
              style={{
                width: `${value}%`,
                background: `linear-gradient(90deg, ${card.color}, rgba(255,255,255,0.62))`,
                boxShadow: `0 0 24px ${card.color}55`,
              }}
            />
            <span
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white/80"
              style={{
                insetInlineStart: `${Math.min(92, value)}%`,
              }}
            />
          </span>
        ))}
      </div>
    );
  }

  if (card.chart === 'pulse') {
    return (
      <div className={`relative z-10 flex h-full items-center ${opacity} transition-opacity`}>
        <svg className="h-full w-full" viewBox="0 0 100 80" role="img" aria-hidden="true">
          <defs>
            <linearGradient id={`${card.id}-wave`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
              <stop offset="45%" stopColor={card.color} />
              <stop offset="100%" stopColor="rgba(255,255,255,0.16)" />
            </linearGradient>
          </defs>
          {[18, 40, 62].map(y => (
            <line key={`${card.id}-pulse-grid-${y}`} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,0.07)" />
          ))}
          <polyline
            points="0,44 10,44 16,26 23,58 31,18 40,62 49,34 58,44 67,28 75,54 84,38 92,44 100,44"
            fill="none"
            stroke={`url(#${card.id}-wave)`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          {[16, 31, 67, 84].map((x, index) => (
            <circle key={`${card.id}-pulse-dot-${index}`} cx={x} cy={[26, 18, 28, 38][index]} r="3" fill={card.color} />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative z-10 flex h-full items-end gap-2 ${opacity} transition-opacity`}>
      {card.values.map((value, index) => (
        <span
          key={`${card.id}-bar-${index}`}
          className="relative flex-1 rounded-t-2xl border border-white/8"
          style={{
            height: `${value}%`,
            background: index === card.values.length - 1
              ? `linear-gradient(180deg, rgba(255,255,255,0.82), ${card.color})`
              : `linear-gradient(180deg, ${card.color}99, rgba(255,255,255,0.12))`,
            boxShadow: index === card.values.length - 1 ? `0 0 28px ${card.color}66` : undefined,
          }}
        >
          {index === card.values.length - 1 && (
            <span
              className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-white/50"
              style={{ backgroundColor: card.color, boxShadow: `0 0 18px ${card.color}` }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

function sparklinePoints(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 64 - ((value - min) / range) * 52;
      return `${x},${y}`;
    })
    .join(' ');
}

function areaPoints(values: number[]) {
  return `0,80 ${sparklinePoints(values)} 100,80`;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);

  if (Number.isNaN(value)) {
    return `rgba(255,255,255,${alpha})`;
  }

  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red},${green},${blue},${alpha})`;
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
