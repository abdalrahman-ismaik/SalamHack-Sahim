'use client';

import { useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

interface WizardStepProps {
  stepNumber:    number;
  totalSteps:    number;
  question:      string;
  options:       string[];
  selectedIndex: number | null;
  onSelect:      (index: number) => void;
  onNext:        () => void;
  onPrev:        () => void;
  isFirst:       boolean;
  isLast:        boolean;
  isSubmitting?: boolean;
}

export function WizardStep({
  stepNumber,
  totalSteps,
  question,
  options,
  selectedIndex,
  onSelect,
  onNext,
  onPrev,
  isFirst,
  isLast,
  isSubmitting = false,
}: WizardStepProps) {
  const t = useTranslations('riskWizard');

  const progressPct = Math.round((stepNumber / totalSteps) * 100);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          onSelect(Math.min(options.length - 1, (selectedIndex ?? -1) + 1));
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          onSelect(Math.max(0, (selectedIndex ?? options.length) - 1));
          break;
        case 'Enter':
          if (selectedIndex !== null && !isSubmitting) onNext();
          break;
        case 'Escape':
          if (!isFirst) onPrev();
          break;
      }
    },
    [selectedIndex, options.length, onSelect, onNext, onPrev, isFirst, isSubmitting],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepNumber}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-6"
        role="group"
        aria-label={t('progress', { current: stepNumber, total: totalSteps })}
      >
        {/* Progress bar */}
        <div className="w-full" aria-hidden="true">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{t('progress', { current: stepNumber, total: totalSteps })}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl font-semibold text-white leading-snug">{question}</h2>

        {/* Option buttons */}
        <fieldset className="flex flex-col gap-3" role="radiogroup">
          <legend className="sr-only">{question}</legend>
          {options.map((option, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isSubmitting}
                onClick={() => onSelect(idx)}
                className={[
                  'min-h-[44px] px-5 py-3 rounded-xl border-2 text-right text-base transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-white font-medium'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-400',
                ].join(' ')}
              >
                {option}
              </button>
            );
          })}
        </fieldset>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-4 pt-2">
          {!isFirst && (
            <button
            type="button"
            onClick={onPrev}
            disabled={isSubmitting}
            className="min-h-[44px] px-6 py-2 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
              {t('previous')}
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={selectedIndex === null || isSubmitting}
            className={[
              'min-h-[44px] flex-1 px-6 py-2 rounded-xl font-semibold transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
              selectedIndex !== null && !isSubmitting
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed',
            ].join(' ')}
          >
            {isSubmitting ? t('saving') : isLast ? t('calculate') : t('next')}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
