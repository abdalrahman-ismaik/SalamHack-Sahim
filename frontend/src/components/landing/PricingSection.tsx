'use client';

import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PricingCard } from '@/components/ui/PricingCard';
import type { PlanId } from '@/lib/types';
import { motion, MotionConfig } from 'framer-motion';
import { ScrollFloat } from '@/components/ui/ScrollFloat';

interface PricingSectionProps {
  currentPlanId?: PlanId;
}

export function PricingSection({ currentPlanId }: PricingSectionProps) {
  const t       = useTranslations('pricing');
  const tHero   = useTranslations('landing.pricing');
  return (
    <MotionConfig reducedMotion="never">
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative px-4 sm:px-6 py-28 overflow-hidden"
    >
      {/* Section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C5A059]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          suppressHydrationWarning
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs text-[#C5A059] font-semibold uppercase tracking-[0.2em] mb-4">
            Pricing
          </p>
          <div className="space-y-3 text-center">
            <ScrollFloat
              id="pricing-heading"
              containerClassName="text-center"
              textClassName="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white"
            >
              {tHero('title')}
            </ScrollFloat>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {tHero('subtitle')}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#C5A059]" />
              <div className="h-1 w-1 rounded-full bg-[#C5A059]" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#C5A059]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          suppressHydrationWarning
          className="grid gap-6 sm:grid-cols-3 items-start"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <PricingCard planId="free"       currentPlanId={currentPlanId} />

          {/* Pro card — CSS animated rings behind it */}
          <div className="relative">
            {/* Three staggered expanding ring ripples */}
            <div aria-hidden="true" className="pro-ring" />
            <div aria-hidden="true" className="pro-ring" />
            <div aria-hidden="true" className="pro-ring" />
            <div className="relative z-10">
              <PricingCard planId="pro" currentPlanId={currentPlanId} />
            </div>
          </div>

          <PricingCard planId="enterprise" currentPlanId={currentPlanId} />
        </motion.div>

        <motion.p
          className="mt-8 text-center text-xs text-gray-600 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          {t('disclaimer')}
        </motion.p>
      </div>
    </section>
    </MotionConfig>
  );
}

