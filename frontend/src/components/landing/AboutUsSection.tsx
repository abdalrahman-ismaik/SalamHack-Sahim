'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion, MotionConfig } from 'framer-motion';
import { ProfileCard } from './ProfileCard';

interface TeamMember {
  name: string;
  title: string;
  handle: string;
  status: string;
  contactText: string;
  initials: string;
  avatarUrl?: string;
}

const CARD_THEMES = [
  {
    accent: '#C5A059',
    gradient: 'linear-gradient(145deg, rgba(197,160,89,0.42) 0%, rgba(19,19,19,0.98) 46%, rgba(0,230,118,0.18) 100%)',
  },
  {
    accent: '#00E676',
    gradient: 'linear-gradient(145deg, rgba(0,230,118,0.30) 0%, rgba(9,9,9,0.98) 48%, rgba(120,190,255,0.18) 100%)',
  },
  {
    accent: '#78BEFF',
    gradient: 'linear-gradient(145deg, rgba(120,190,255,0.36) 0%, rgba(8,8,8,0.98) 50%, rgba(197,160,89,0.18) 100%)',
  },
  {
    accent: '#FFB300',
    gradient: 'linear-gradient(145deg, rgba(255,179,0,0.34) 0%, rgba(10,10,10,0.98) 48%, rgba(255,255,255,0.10) 100%)',
  },
];

export function AboutUsSection() {
  const t = useTranslations('landing.about');
  const locale = useLocale();
  const members = t.raw('members') as TeamMember[];

  return (
    <MotionConfig reducedMotion="never">
      <section
        id="about"
        aria-labelledby="about-heading"
        className="relative overflow-hidden px-4 py-24 sm:px-6"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-14 max-w-3xl text-center"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#C5A059]">
              {t('eyebrow')}
            </p>
            <h2 id="about-heading" className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              {t('title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
              {t('subtitle')}
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4" dir="rtl">
            {members.map((member, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              return (
                <motion.div
                  key={member.handle}
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                >
                  <ProfileCard
                    {...member}
                    accent={theme.accent}
                    gradient={theme.gradient}
                    enableTilt
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
