'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';

export function NewsletterSection() {
  const t      = useTranslations('landing.newsletter');
  const locale = useLocale();
  const isRTL  = locale === 'ar';

  const [email,     setEmail]     = useState('');
  const [status,    setStatus]    = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      setErrorText(t('invalidEmail'));
      return;
    }

    setStatus('loading');
    setErrorText('');

    try {
      // Persist locally — replace with a real API call when backend is ready
      const existing = JSON.parse(localStorage.getItem('newsletter_subs') ?? '[]') as string[];
      if (!existing.includes(trimmed)) {
        localStorage.setItem('newsletter_subs', JSON.stringify([...existing, trimmed]));
      }
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorText(t('genericError'));
    }
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative px-4 sm:px-6 py-16 overflow-hidden"
    >
      {/* Section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-5xl mx-auto"
      >
        {/* Card */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Gold → dark blue gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1000] via-[#0d0d0d] to-[#0a1628] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059]/20 via-transparent to-[#1a4080]/30 pointer-events-none" />
          {/* Subtle glow orbs */}
          <div className="absolute -top-10 left-1/4 w-64 h-64 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-1/4 w-64 h-64 bg-[#1a4080]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 border border-[#C5A059]/45 rounded-2xl px-8 py-10 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h2
                  id="newsletter-heading"
                  className="text-2xl md:text-3xl font-bold text-white leading-snug"
                >
                  {t('title')}
                </h2>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  {t('subtitle')}
                </p>
              </div>

              {/* Form */}
              <div className="flex-shrink-0 w-full md:w-auto md:min-w-[400px]">
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-full px-6 py-3"
                  >
                    <svg className="w-5 h-5 text-[#C5A059] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[#C5A059] font-medium text-sm">{t('successMessage')}</span>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    aria-label={t('formLabel')}
                    noValidate
                  >
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label htmlFor="newsletter-email" className="sr-only">
                          {t('emailPlaceholder')}
                        </label>
                        <input
                          id="newsletter-email"
                          type="email"
                          value={email}
                          onChange={e => { setEmail(e.target.value); setStatus('idle'); setErrorText(''); }}
                          placeholder={t('emailPlaceholder')}
                          autoComplete="email"
                          aria-invalid={status === 'error'}
                          aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                          className="w-full rounded-full bg-white/10 border border-white/30 text-white placeholder-gray-500 text-sm px-5 py-3 outline-none focus:ring-2 focus:ring-[#C5A059]/60 focus:border-[#C5A059]/60 transition-all"
                          dir="ltr"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="shrink-0 rounded-full bg-[#C5A059] hover:bg-[#d4b06a] disabled:opacity-60 text-black font-semibold text-sm px-6 py-3 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        {status === 'loading' ? (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                            {t('subscribing')}
                          </span>
                        ) : t('cta')}
                      </button>
                    </div>
                    {status === 'error' && (
                      <p id="newsletter-error" role="alert" className="mt-2 text-xs text-red-400 px-2">
                        {errorText}
                      </p>
                    )}
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
