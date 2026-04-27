'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useUserTier } from '@/hooks/useUserTier';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { GooeyNav } from '@/components/ui/GooeyNav';
import { GradientText } from '@/components/ui/GradientText';
import { motion, AnimatePresence } from 'framer-motion';

export function NavBar() {
  const t      = useTranslations('nav');
  const locale = useLocale();
  const tier   = useUserTier();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = tier !== 'guest';

  const navLinks = [
    { label: t('home'),         href: `/${locale}` },
    { label: t('features'),     href: `/${locale}#features` },
    { label: t('pricing'),      href: `/${locale}#pricing` },
    { label: t('testimonials'), href: `/${locale}#testimonials` },
    { label: t('faq'),          href: `/${locale}#faq` },
    ...(isAuthenticated ? [{ label: t('dashboard'), href: `/${locale}/dashboard` }] : []),
  ];

  return (
    <header className="fixed top-0 z-30 w-full flex justify-center px-4 pt-4 pointer-events-none">
      {/* Floating glass pill */}
      <nav
        aria-label="Site navigation"
        className="pointer-events-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0d0d0d]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-shadow duration-300"
      >
        <div className="px-4 sm:px-5 h-14 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          {/* Logo */}
          <a
            href={`/${locale}`}
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-lg"
          >
            <GradientText
              className="text-xl font-bold"
              colors={['#C5A059', '#F0D590', '#ffffff', '#F0D590', '#C5A059']}
              animationSpeed={6}
            >
              <span dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {locale === 'ar' ? 'سهم' : '$ahim'}
              </span>
            </GradientText>
          </a>

          {/* Desktop nav — GooeyNav centred */}
          <div className="hidden md:flex items-center justify-center">
            <GooeyNav
              items={navLinks}
              particleCount={12}
              particleDistances={[70, 8]}
              particleR={80}
              animationTime={800}
              timeVariance={350}
              colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              initialActiveIndex={0}
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 justify-end">
            <LanguageSwitcher />

            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <a href={`/${locale}/dashboard`}>
                  <Button variant="gold" size="sm">{t('dashboard')}</Button>
                </a>
              ) : (
                <>
                  <a href={`/${locale}/auth/signin`}>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      {t('signIn')}
                    </Button>
                  </a>
                  <a href={`/${locale}/auth/signup`}>
                    <Button variant="gold" size="sm">{t('signUp')}</Button>
                  </a>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown — sits inside the pill */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-white/5 overflow-hidden rounded-b-2xl"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block px-4 py-3 text-sm font-medium text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-3 border-t border-white/5 flex gap-2">
                  {isAuthenticated ? (
                    <a href={`/${locale}/dashboard`} className="flex-1">
                      <Button variant="gold" size="sm" className="w-full">{t('dashboard')}</Button>
                    </a>
                  ) : (
                    <>
                      <a href={`/${locale}/auth/signin`} className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full">{t('signIn')}</Button>
                      </a>
                      <a href={`/${locale}/auth/signup`} className="flex-1">
                        <Button variant="gold" size="sm" className="w-full">{t('signUp')}</Button>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

