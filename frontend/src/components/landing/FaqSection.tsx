'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { ScrollFloat } from '@/components/ui/ScrollFloat';

type FaqItem = { q: string; a: string };

export function FaqSection() {
  const t       = useTranslations('landing.faq');
  const [open, setOpen] = useState<number | null>(0);
  const items = t.raw('items') as FaqItem[];

  return (
    <MotionConfig reducedMotion="never">
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative px-4 sm:px-6 py-28 overflow-hidden"
    >
      {/* Section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          suppressHydrationWarning
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs text-[#C5A059] font-semibold uppercase tracking-[0.2em] mb-4">
            FAQ
          </p>
          <ScrollFloat
            id="faq-heading"
            textClassName="text-4xl md:text-5xl font-extrabold text-white"
          >
            {t('title')}
          </ScrollFloat>
          <p className="mt-4 text-gray-400">{t('subtitle')}</p>
        </motion.div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <motion.div
              suppressHydrationWarning
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${
                open === i
                  ? 'border-[#C5A059]/30 bg-[#111]'
                  : 'border-[#1e1e1e] bg-[#0d0d0d] hover:border-[#2A2A2A]'
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-start px-6 py-5 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/40 rounded-2xl"
                aria-expanded={open === i}
              >
                <span
                  className={`font-semibold text-sm leading-snug transition-colors ${
                    open === i ? 'text-[#C5A059]' : 'text-white'
                  }`}
                >
                  {item.q}
                </span>
                <span
                  className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 ${
                    open === i
                      ? 'border-[#C5A059]/40 text-[#C5A059] rotate-45'
                      : 'border-[#2A2A2A] text-gray-500'
                  }`}
                  aria-hidden="true"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-[#1a1a1a]">
                      <div className="pt-4">{item.a}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </MotionConfig>
  );
}
