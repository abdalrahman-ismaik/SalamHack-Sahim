'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { GoldPriceData, ZakatResult } from '@/lib/types';

type Currency = 'AED' | 'USD' | 'SAR';

const NISAB_GOLD_GRAMS = 85;
const ZAKAT_RATE = 0.025;

interface ZakatCalculatorProps {
  goldPrice: GoldPriceData | null;
}

function getPriceForCurrency(gold: GoldPriceData, currency: Currency): number {
  if (currency === 'AED') return gold.price_per_gram_aed;
  if (currency === 'SAR') return gold.price_per_gram_sar;
  return gold.price_per_gram_usd;
}

export function ZakatCalculator({ goldPrice }: ZakatCalculatorProps) {
  const t = useTranslations('zakatCalculator');

  const [portfolio,   setPortfolio]   = useState('');
  const [liabilities, setLiabilities] = useState('');
  const [currency,    setCurrency]    = useState<Currency>('AED');
  const [result,      setResult]      = useState<ZakatResult | null>(null);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [formulaOpen, setFormula]     = useState(false);

  const currencies: Currency[] = ['AED', 'USD', 'SAR'];

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const p = parseFloat(portfolio);
    const l = parseFloat(liabilities);

    if (isNaN(p) || p < 0 || !isFinite(p)) errs.portfolio = 'يرجى إدخال قيمة صالحة (≥ 0)';
    if (isNaN(l) || l < 0 || !isFinite(l)) errs.liabilities = 'يرجى إدخال قيمة صالحة (≥ 0)';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function calculate() {
    if (!validate()) return;

    const p = parseFloat(portfolio);
    const l = parseFloat(liabilities);
    const net = p - l;

    const pricePerGram = goldPrice ? getPriceForCurrency(goldPrice, currency) : 96.50;
    const nisabValue   = NISAB_GOLD_GRAMS * pricePerGram;
    const belowNisab   = net < nisabValue;

    setResult({
      net_value:       net,
      nisab_value:     nisabValue,
      nisab_source:    goldPrice?.source === 'TwelveData' ? 'api' : 'static',
      gold_price_date: goldPrice?.date ?? 'unknown',
      zakat_due:       belowNisab ? null : parseFloat((net * ZAKAT_RATE).toFixed(2)),
      below_nisab:     belowNisab,
      currency,
    });
  }

  return (
    <div className="space-y-5">
      {/* Portfolio input */}
      <div className="flex flex-col gap-1">
        <label htmlFor="zakat-portfolio" className="text-sm text-gray-400">
          {t('portfolioLabel')}
        </label>
        <input
          id="zakat-portfolio"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={portfolio}
          onChange={e => { setPortfolio(e.target.value); setResult(null); }}
          className="min-h-[44px] rounded-xl bg-gray-800 border border-gray-600 px-4 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          placeholder="0.00"
        />
        {errors.portfolio && <p className="text-xs text-rose-400">{errors.portfolio}</p>}
      </div>

      {/* Liabilities input */}
      <div className="flex flex-col gap-1">
        <label htmlFor="zakat-liabilities" className="text-sm text-gray-400">
          {t('liabilitiesLabel')}
        </label>
        <input
          id="zakat-liabilities"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={liabilities}
          onChange={e => { setLiabilities(e.target.value); setResult(null); }}
          className="min-h-[44px] rounded-xl bg-gray-800 border border-gray-600 px-4 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          placeholder="0.00"
        />
        {errors.liabilities && <p className="text-xs text-rose-400">{errors.liabilities}</p>}
      </div>

      {/* Currency selector */}
      <div className="flex flex-col gap-1">
        <label htmlFor="zakat-currency" className="text-sm text-gray-400">
          {t('currencyLabel')}
        </label>
        <select
          id="zakat-currency"
          value={currency}
          onChange={e => { setCurrency(e.target.value as Currency); setResult(null); }}
          className="min-h-[44px] rounded-xl bg-gray-800 border border-gray-600 px-4 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {currencies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Gold price source note */}
      {goldPrice && (
        <p className="text-xs text-gray-500">
          {t('goldPriceSource', {
            source: t(`nisabSource.${goldPrice.source === 'TwelveData' ? 'api' : 'static'}`),
            date: goldPrice.date,
          })}
        </p>
      )}

      {/* Calculate button */}
      <button
        type="button"
        onClick={calculate}
        className="min-h-[44px] w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        {t('calculateButton')}
      </button>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Nisab info */}
          <div className="rounded-xl bg-gray-800/60 border border-gray-700 px-5 py-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{t('nisabLabel')}</span>
              <span className="text-white font-medium">
                {result.nisab_value.toLocaleString('ar-SA', { maximumFractionDigits: 0 })} {result.currency}
              </span>
            </div>
            {result.nisab_source === 'static' && (
              <p className="text-xs text-amber-400 mt-1">{t('nisabSource.static')}</p>
            )}
          </div>

          {/* Zakat result */}
          {result.below_nisab ? (
            <div className="rounded-xl bg-blue-500/10 border border-blue-400/30 px-5 py-4 text-center text-blue-300">
              <p className="text-sm">{t('belowNisab')}</p>
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 px-5 py-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{t('zakatDue')}</p>
              <p className="text-3xl font-bold text-emerald-300">
                {result.zakat_due?.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} {result.currency}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Expandable methodology */}
      <div className="border-t border-gray-700 pt-3">
        <button
          type="button"
          onClick={() => setFormula(o => !o)}
          className="text-sm text-gray-400 hover:text-white w-full text-right flex justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
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
    </div>
  );
}
