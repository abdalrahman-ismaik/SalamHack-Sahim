'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { PRICING_PLANS } from '@/lib/pricing';
import type { PlanId } from '@/lib/types';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { SectionHeading } from './SectionHeading';

interface PricingCardProps {
  planId:        PlanId;
  currentPlanId?: PlanId;
}

export function PricingCard({ planId, currentPlanId }: PricingCardProps) {
  const t      = useTranslations('pricing');
  const locale = useLocale();
  const plan   = PRICING_PLANS.find(p => p.id === planId)!;

  const isCurrent    = planId === currentPlanId;
  const isHighlighted = plan.highlighted;

  const ctaHref = planId === 'free'
    ? `/${locale}/auth/signup`
    : planId === 'pro'
      ? `/${locale}/auth/signup?plan=pro`
      : `mailto:enterprise@salam.app`;

  const features: string[] = t.raw(`${planId}.features`) as string[];

  return (
    <Card
      as="article"
      variant={isHighlighted ? 'gold' : 'default'}
      hover={!isCurrent}
      className={
        isHighlighted
          ? 'relative scale-105 z-10'
          : 'relative'
      }
    >
      {isHighlighted && (
        <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
          <Badge variant="gold" glow>{t('popular')}</Badge>
        </div>
      )}

      <SectionHeading
        level={3}
        size="md"
        label={t(`${planId}.name`)}
        description={t(`${planId}.tagline`)}
      />

      <p className="mt-4 text-3xl font-bold text-white">
        {t(`${planId}.price`)}
      </p>

      <ul className="mt-4 space-y-3 text-sm text-gray-400" aria-label="Plan features">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span aria-hidden="true" className="text-[#00E676] mt-0.5 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {isCurrent ? (
          <Button variant="outline" className="w-full border-white/20" disabled aria-disabled="true">
            {t('currentPlan')}
          </Button>
        ) : (
          <a href={ctaHref} className="block w-full">
            <Button 
              variant={isHighlighted ? 'gold' : 'outline'} 
              className="w-full"
            >
              {t(`${planId}.cta`)}
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
}
