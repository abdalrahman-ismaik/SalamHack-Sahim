'use client';

import { useTranslations } from 'next-intl';
import { motion, MotionConfig } from 'framer-motion';
import { ScrollFloat } from '@/components/ui/ScrollFloat';

type TestimonialItem = { quote: string; name: string; role: string };

export function TestimonialsSection() {
  const t       = useTranslations('landing.testimonials');
  const items   = t.raw('items') as TestimonialItem[];

  return (
    <MotionConfig reducedMotion="never">
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative px-4 sm:px-6 py-28 overflow-hidden"
    >
      {/* Section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent" />
      {/* Subtle bg tint */}
      <div className="absolute inset-0 bg-[#0a0a0a]/40 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          suppressHydrationWarning
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs text-[#C5A059] font-semibold uppercase tracking-[0.2em] mb-4">
            Testimonials
          </p>
          <ScrollFloat
            id="testimonials-heading"
            textClassName="text-4xl md:text-5xl font-extrabold text-white"
          >
            {t('title')}
          </ScrollFloat>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <motion.div
              suppressHydrationWarning
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-[#0d0d0d] border border-[#1e1e1e] rounded-3xl p-6 hover:border-[#2A2A2A] hover:bg-[#111] transition-all duration-300 flex flex-col gap-4"
            >
              {/* Opening quote mark */}
              <div className="text-5xl text-[#C5A059]/20 font-serif leading-none select-none">&ldquo;</div>

              <p className="text-gray-300 leading-relaxed text-sm flex-1">
                {item.quote}
              </p>

              {/* Star rating */}
              <div className="flex gap-0.5" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} className="w-3.5 h-3.5 text-[#C5A059]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#1a1a1a]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C5A059]/30 to-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] text-sm font-bold shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                  <p className="text-gray-600 text-[10px] truncate">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </MotionConfig>
  );
}
