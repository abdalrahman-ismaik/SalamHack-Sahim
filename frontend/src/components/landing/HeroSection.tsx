'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function HeroSection() {
  const t        = useTranslations('landing.hero');
  const locale   = useLocale();
  const reduced  = useReducedMotion();

  const variants = {
    hidden:  { opacity: 0, y: reduced ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.5 } },
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="flex flex-col items-center text-center gap-6 px-4 py-20 bg-white"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className="max-w-2xl"
      >
        <h1
          id="hero-heading"
          className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl"
        >
          {t('headline')}
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          {t('subheadline')}
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <a href={`/${locale}/auth/signup`}>
            <Button variant="default" size="lg">
              {t('cta')}
            </Button>
          </a>
          <a href={`/${locale}#pricing`}>
            <Button variant="outline" size="lg">
              {t('ctaSecondary')}
            </Button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
