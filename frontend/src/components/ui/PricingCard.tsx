'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Link } from 'next-intl/client';
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
      className={
        isHighlighted
          ? 'relative ring-2 ring-emerald-500 shadow-lg'
          : 'relative'
      }
    >
      {isHighlighted && (
        <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
          <Badge variant="success">Popular</Badge>
        </div>
      )}

      <SectionHeading
        level={3}
        size="md"
        label={t(`${planId}.name`)}
        description={t(`${planId}.tagline`)}
      />

      <p className="mt-4 text-2xl font-bold text-gray-900">
        {t(`${planId}.price`)}
      </p>

      <ul className="mt-4 space-y-2 text-sm text-gray-600" aria-label="Plan features">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <span aria-hidden="true" className="text-emerald-500 mt-0.5">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {isCurrent ? (
          <Button variant="outline" className="w-full" disabled aria-disabled="true">
            Current Plan
          </Button>
        ) : planId === 'enterprise' ? (
          <a href={ctaHref}>
            <Button variant={plan.ctaVariant as 'outline' | 'default'} className="w-full">
              {t(`${planId}.cta`)}
            </Button>
          </a>
        ) : (
          <a href={ctaHref}>
            <Button variant={plan.ctaVariant as 'outline' | 'default'} className="w-full">
              {t(`${planId}.cta`)}
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
}
