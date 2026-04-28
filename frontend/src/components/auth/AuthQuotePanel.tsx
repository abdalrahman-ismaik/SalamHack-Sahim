'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Quote {
  text:   { en: string; ar: string };
  author: { en: string; ar: string };
  title:  { en: string; ar: string };
}

const QUOTES: Quote[] = [
  {
    text: {
      en: 'In the race for excellence, there is no finish line.',
      ar: 'في سباق التميّز لا يوجد خطّ نهاية.',
    },
    author: { en: 'Sheikh Mohammed bin Rashid Al Maktoum', ar: 'الشيخ محمد بن راشد آل مكتوم' },
    title:  { en: 'Ruler of Dubai · UAE',                 ar: 'حاكم دبي · الإمارات العربية المتحدة' },
  },
  {
    text: {
      en: 'What is built on the permissible endures; what is built otherwise fades away.',
      ar: 'ما بُني على الحلال دام وبقي، وما بُني على الحرام زال وانتهى.',
    },
    author: { en: 'Sulaiman Al-Rajhi',    ar: 'سليمان الراجحي' },
    title:  { en: 'Founder, Al Rajhi Bank', ar: 'مؤسس مصرف الراجحي' },
  },
  {
    text: {
      en: 'Long-term thinking and patience are the cornerstones of great wealth.',
      ar: 'التفكير بعيد المدى والصبر هما أساسا الثروة الحقيقية.',
    },
    author: { en: 'Prince Al-Waleed bin Talal',    ar: 'الأمير الوليد بن طلال' },
    title:  { en: 'Kingdom Holding Company · KSA', ar: 'شركة المملكة القابضة · المملكة العربية السعودية' },
  },
  {
    text: {
      en: 'I despise seeing any of you idle at home saying "O God, provide for me" — while knowing that the sky rains neither gold nor silver.',
      ar: 'إنّي أُكره أن أرى أحدكم خاملًا في بيته، يقول: اللهم ارزقني، وقد علم أن السماء لا تمطر ذهبًا ولا فضة.',
    },
    author: { en: 'Umar ibn al-Khattab', ar: 'عمر بن الخطاب' },
    title:  { en: 'Second Caliph of Islam', ar: 'ثاني الخلفاء الراشدين' },
  },
  {
    text: {
      en: 'Diversification across the right sectors is not caution — it is wisdom.',
      ar: 'التنويع في القطاعات الصحيحة ليس تحوّطاً — بل هو حكمة.',
    },
    author: { en: 'Naguib Sawiris',    ar: 'نجيب ساويرس' },
    title:  { en: 'Orascom Group · Egypt', ar: 'مجموعة أوراسكوم · مصر' },
  },
  {
    text: {
      en: 'Show me the market.',
      ar: 'دلوني على السوق.',
    },
    author: { en: 'Abd al-Rahman ibn Awf', ar: 'عبد الرحمن بن عوف' },
    title:  { en: 'Companion of the Prophet ﷺ', ar: 'صحابي رسول الله ﷺ' },
  },
];

interface Props {
  locale: string;
}

export function AuthQuotePanel({ locale }: Props) {
  const isAr = locale === 'ar';
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % QUOTES.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const q = QUOTES[index];

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="relative flex-1 flex flex-col justify-between rounded-2xl h-full overflow-hidden
                 border border-white/10 bg-black/20 backdrop-blur-xl
                 px-10 py-10"
    >
      {/* Subtle gold tint overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#C5A059]/5 via-transparent to-[#C5A059]/8" />

      {/* Logo / brand */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30">
          <svg className="h-4 w-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
        <span className="text-base font-semibold text-[#C5A059]">
          {isAr ? 'سهم · منصة الاستثمار الحلال' : '$ahim · Halal Investment Intelligence'}
        </span>
      </div>

      {/* Quote block */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-center py-6 overflow-hidden">
        {/* Giant decorative quote mark */}
        <svg
          aria-hidden="true"
          className="mb-6 h-14 w-14 text-[#C5A059]/20"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <blockquote
            lang={isAr ? 'ar' : 'en'}
            className="font-light leading-relaxed tracking-wide text-white/90"
            style={{ fontSize: 'clamp(0.875rem, 2vw, 1.375rem)' }}
          >
            {isAr ? q.text.ar : q.text.en}
          </blockquote>

          <div className="mt-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-[#C5A059]/50 to-transparent" />
            <div className={isAr ? 'text-end' : 'text-start'}>
              <p className="text-sm font-semibold text-[#C5A059]">
                {isAr ? q.author.ar : q.author.en}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {isAr ? q.title.ar : q.title.en}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress dots */}
        <div className="mt-6 flex gap-2">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              aria-label={`Quote ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                i === index
                  ? 'w-8 bg-[#C5A059]'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom trust badges */}
      <div className="relative z-10 flex flex-wrap gap-4">
        {[
          { icon: '✓', label: isAr ? 'بيانات فورية'       : 'Real-time Data' },
          { icon: '✓', label: isAr ? 'أسواق عالمية'        : 'Global Markets' },
        ].map(b => (
          <span key={b.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="text-[#C5A059]">{b.icon}</span>
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
