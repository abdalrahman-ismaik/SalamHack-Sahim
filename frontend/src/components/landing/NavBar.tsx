'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useUserTier } from '@/hooks/useUserTier';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';

export function NavBar() {
  const t      = useTranslations('nav');
  const locale = useLocale();
  const tier   = useUserTier();

  const isAuthenticated = tier !== 'guest';

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <nav
        aria-label="Site navigation"
        className="mx-auto flex max-w-5xl items-center justify-between px-4 h-14"
      >
        <a
          href={`/${locale}`}
          className="text-lg font-bold text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
        >
          سهم
        </a>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <a href={`/${locale}/dashboard`}>
              <Button variant="ghost" size="sm">{t('dashboard')}</Button>
            </a>
          ) : (
            <>
              <a href={`/${locale}/auth/signin`}>
                <Button variant="ghost" size="sm">{t('signIn')}</Button>
              </a>
              <a href={`/${locale}/auth/signup`}>
                <Button variant="default" size="sm">{t('signUp')}</Button>
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
