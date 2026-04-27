'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, MotionConfig } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ScrollFloat } from '@/components/ui/ScrollFloat';

export function CtaBannerSection() {
  const t       = useTranslations('landing.cta');
  const tSearch = useTranslations('search');
  const locale  = useLocale();
  const router  = useRouter();
  const [ticker, setTicker] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = ticker.trim().toUpperCase();
    if (sym) router.push(`/${locale}/stock/${sym}`);
  };

  return (
    <MotionConfig reducedMotion="never">
    <section
      aria-labelledby="cta-heading"
      className="relative px-4 sm:px-6 py-28 overflow-hidden"
    >
      {/* Section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent" />

      <motion.div
        suppressHydrationWarning
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative max-w-4xl mx-auto"
      >
        {/* Outer card */}
        <div className="relative bg-[#0d0d0d] border border-[#C5A059]/15 rounded-[2.5rem] p-10 md:p-16 text-center overflow-hidden">
          {/* Interior glow orbs */}
          <div className="absolute -top-16 left-1/3 w-72 h-72 bg-[#C5A059]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 right-1/3 w-56 h-56 bg-[#00E676]/6 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Brand */}
            <p
              className="text-5xl font-extrabold text-[#C5A059] mb-5 leading-none"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              {locale === 'ar' ? 'سهم' : '$ahim'}
            </p>

            <ScrollFloat
              id="cta-heading"
              containerClassName="mb-5"
              textClassName="text-3xl md:text-5xl font-extrabold text-white leading-tight"
            >
              {t('title')}
            </ScrollFloat>

            <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              {t('subtitle')}
            </p>

            {/* Primary CTA */}
            <div className="flex justify-center mb-8">
              <a href={`/${locale}/auth/signup`}>
                <Button variant="gold" size="lg" className="min-w-[220px]">
                  {t('button')}
                </Button>
              </a>
            </div>

            {/* Divider */}
            <p className="text-xs text-gray-600 mb-4">{t('tryLabel')}</p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex gap-2 max-w-sm mx-auto"
              role="search"
            >
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder={tSearch('placeholder')}
                maxLength={10}
                aria-label={tSearch('placeholder')}
                className="flex-1 bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C5A059]/50 focus:ring-1 focus:ring-[#C5A059]/20 transition-colors"
              />
              <Button
                type="submit"
                variant="outline"
                className="border-[#2A2A2A] text-gray-300 hover:border-[#C5A059]/40 hover:text-[#C5A059] px-4"
              >
                {tSearch('button')}
              </Button>
            </form>

            <p className="mt-5 text-xs text-gray-700">
              No account needed · Free forever
            </p>
          </div>
        </div>
      </motion.div>
    </section>
    </MotionConfig>
  );
}
