'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Bell, CheckCircle2, Newspaper, ShieldCheck, X } from 'lucide-react';

interface DashboardNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  href: string;
  tone: 'gold' | 'green' | 'blue';
}

const toneClasses = {
  gold: 'border-[#C5A059]/25 bg-[#C5A059]/10 text-[#E8D4B0]',
  green: 'border-[#00E676]/25 bg-[#00E676]/10 text-[#7CFFBA]',
  blue: 'border-sky-300/20 bg-sky-300/10 text-sky-200',
};

export function DashboardNotificationCenter() {
  const t = useTranslations('dashboard.notifications');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const notifications = useMemo<DashboardNotification[]>(() => [
    {
      id: 'market',
      title: t('market.title'),
      body: t('market.body'),
      time: t('market.time'),
      href: `/${locale}/stock`,
      tone: 'blue',
    },
    {
      id: 'halal',
      title: t('halal.title'),
      body: t('halal.body'),
      time: t('halal.time'),
      href: `/${locale}/stock`,
      tone: 'green',
    },
    {
      id: 'zakat',
      title: t('zakat.title'),
      body: t('zakat.body'),
      time: t('zakat.time'),
      href: `/${locale}/tools/zakat`,
      tone: 'gold',
    },
  ], [locale, t]);

  const visible = notifications.filter(item => !dismissed.includes(item.id));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-white/70 transition-colors hover:border-[#C5A059]/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
        aria-label={t('open')}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {visible.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C5A059] px-1 text-[10px] font-bold text-black">
            {visible.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-14 z-40 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#101010]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">{t('title')}</p>
              <p className="text-xs text-white/45">{t('subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/45 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              aria-label={t('close')}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="max-h-[360px] space-y-2 overflow-y-auto p-3">
            {visible.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <CheckCircle2 className="h-5 w-5 text-[#00E676]" aria-hidden="true" />
                <p className="text-sm text-white/60">{t('empty')}</p>
              </div>
            ) : (
              visible.map(item => (
                <div key={item.id} className="group rounded-xl border border-white/10 bg-white/[0.035] p-3 transition-colors hover:bg-white/[0.055]">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${toneClasses[item.tone]}`}>
                      {item.id === 'market' ? <Newspaper className="h-4 w-4" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={item.href} className="text-sm font-semibold text-white transition-colors hover:text-[#E8D4B0]">
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDismissed(prev => [...prev, item.id])}
                          className="rounded-md p-1 text-white/35 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                          aria-label={t('dismiss')}
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-white/50">{item.body}</p>
                      <p className="mt-2 text-[11px] text-white/35">{item.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
