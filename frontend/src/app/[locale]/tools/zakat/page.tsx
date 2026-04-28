'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ZakatCalculator } from '@/components/ZakatCalculator';
import { useSoftGate } from '@/hooks/useSoftGate';
import type { GoldPriceData } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function ZakatPage() {
  const t = useTranslations('zakatCalculator');
  const { gateOpen } = useSoftGate(false); // only open gate if user is guest; controlled externally
  const [goldPrice, setGoldPrice] = useState<GoldPriceData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [isGuest, setIsGuest]     = useState(false);

  useEffect(() => {
    // Check auth state to determine guest
    import('@/lib/firebase').then(({ auth }) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        setIsGuest(!user);
      });
      return unsubscribe;
    });

    fetch(`${API_BASE}/api/tools/gold-price`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setGoldPrice)
      .catch(() => setGoldPrice(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main
      className="min-h-screen bg-gray-950 text-white px-4 py-12"
      dir="rtl"
    >
      <div className="max-w-xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-emerald-300">{t('title')}</h1>

        {loading ? (
          <div className="h-48 rounded-2xl bg-gray-900 animate-pulse" aria-label="loading" />
        ) : (
          <div className="rounded-2xl border border-gray-700 bg-gray-900/70 p-6 space-y-6">
            <ZakatCalculator goldPrice={goldPrice} />

            {/* Soft gate for guests — save prompt below calculator */}
            {isGuest && (
              <div className="rounded-xl border border-gray-700 bg-gray-800/50 px-5 py-4 text-center text-sm text-gray-400">
                {t('signInGate')}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
