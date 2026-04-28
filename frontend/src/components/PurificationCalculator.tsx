'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

type Currency = 'AED' | 'USD' | 'SAR';

interface PurificationCalculatorProps {
  /** nonHalalPct is 0–100 (percent), or null when data unavailable */
  nonHalalPct:      number | null;
  defaultCurrency?: Currency;
}

export function PurificationCalculator({
  nonHalalPct,
  defaultCurrency = 'SAR',
}: PurificationCalculatorProps) {
  const t = useTranslations('purification');

  const [dividend, setDividend]     = useState('');
  const [currency, setCurrency]     = useState<Currency>(defaultCurrency);
  const [formulaOpen, setFormula]   = useState(false);
  const [touched, setTouched]       = useState(false);

  // FR-P05: if ratio is exactly 0, show minimal "no cleanup needed" note
  if (nonHalalPct === 0) {
    return (
      <p className="mt-3 text-sm text-emerald-400">
        ✓ {t('noCleanup')}
      </p>
    );
  }

  // Derive numeric values
  const dividendNum   = parseFloat(dividend);
  const isValidAmount = !isNaN(dividendNum) && dividendNum > 0;
  const purifyAmount  = nonHalalPct !== null && isValidAmount
    ? (dividendNum * (nonHalalPct / 100)).toFixed(2)
    : null;

  const currencies: Currency[] = ['AED', 'USD', 'SAR'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl border border-amber-600/40 bg-amber-500/5 p-5 space-y-4"
    >
      <h3 className="font-semibold text-amber-300">{t('title')}</h3>

      {/* FR-P06: unavailable state */}
      {nonHalalPct === null && (
        <p className="text-sm text-rose-400">{t('unavailable')}</p>
      )}

      {/* Active calculator */}
      {nonHalalPct !== null && nonHalalPct > 0 && (
        <>
          {/* Dividend input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="purif-dividend" className="text-sm text-gray-400">
              {t('dividendLabel')}
            </label>
            <input
              id="purif-dividend"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={dividend}
              onChange={e => { setDividend(e.target.value); setTouched(true); }}
              className="min-h-[44px] rounded-xl bg-gray-800 border border-gray-600 px-4 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-describedby="purif-error"
              placeholder="0.00"
              disabled={nonHalalPct === null}
            />
            {touched && !isValidAmount && dividend !== '' && (
              <p id="purif-error" className="text-xs text-rose-400" role="alert">
                {t('invalidAmount')}
              </p>
            )}
          </div>

          {/* Currency selector */}
          <div className="flex flex-col gap-1">
            <label htmlFor="purif-currency" className="text-sm text-gray-400">
              {t('currencyLabel')}
            </label>
            <select
              id="purif-currency"
              value={currency}
              onChange={e => setCurrency(e.target.value as Currency)}
              className="min-h-[44px] rounded-xl bg-gray-800 border border-gray-600 px-4 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {currencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Real-time result */}
          {purifyAmount !== null && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-5 py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">{t('resultLabel')}</p>
              <p className="text-2xl font-bold text-amber-300">
                {purifyAmount} {currency}
              </p>
            </div>
          )}
        </>
      )}

      {/* Expandable methodology */}
      <div className="border-t border-gray-700 pt-3">
        <button
          type="button"
          onClick={() => setFormula(o => !o)}
          className="text-sm text-gray-400 hover:text-white w-full text-right flex justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-expanded={formulaOpen}
        >
          <span aria-hidden="true">{formulaOpen ? '▲' : '▼'}</span>
          <span>{t('formulaTitle')}</span>
        </button>
        {formulaOpen && (
          <p className="mt-2 text-sm text-gray-400">{t('formulaText')}</p>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 leading-relaxed">{t('disclaimer')}</p>
    </motion.div>
  );
}
