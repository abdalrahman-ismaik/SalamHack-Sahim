'use client';

import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PricingCard } from '@/components/ui/PricingCard';
import type { PlanId } from '@/lib/types';

interface PricingSectionProps {
  currentPlanId?: PlanId;
}

export function PricingSection({ currentPlanId }: PricingSectionProps) {
  const t       = useTranslations('pricing');
  const tHero   = useTranslations('landing.pricing');

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="px-4 py-16 bg-white"
    >
      <SectionHeading
        level={2}
        size="lg"
        align="center"
        label={tHero('title')}
        description={tHero('subtitle')}
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
        <PricingCard planId="free"       currentPlanId={currentPlanId} />
        <PricingCard planId="pro"        currentPlanId={currentPlanId} />
        <PricingCard planId="enterprise" currentPlanId={currentPlanId} />
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        {t('disclaimer')}
      </p>
    </section>
  );
}
