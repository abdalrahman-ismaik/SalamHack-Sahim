'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { WizardStep } from '@/components/ui/WizardStep';
import type { RiskLabel, RiskProfile } from '@/lib/types';

// ---------------------------------------------------------------------------
// Scoring weights (must sum to 1.0)
// ---------------------------------------------------------------------------
const WEIGHTS = {
  q1: 0.25, // investment horizon
  q2: 0.20, // max acceptable drawdown
  q3: 0.15, // age
  q4: 0.15, // financial knowledge
  q5: 0.15, // income stability
  q6: 0.10, // patience during downturns
} as const;

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;
type QuestionKey = (typeof QUESTION_KEYS)[number];

function scoreToLabel(score: number): RiskLabel {
  if (score <= 40) return 'conservative';
  if (score <= 70) return 'moderate';
  return 'aggressive';
}

const LABEL_COLORS: Record<RiskLabel, string> = {
  conservative: 'bg-blue-500/20 border-blue-400 text-blue-300',
  moderate:     'bg-amber-500/20 border-amber-400 text-amber-300',
  aggressive:   'bg-rose-500/20 border-rose-400 text-rose-300',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface RiskWizardProps {
  onComplete?: (profile: RiskProfile) => void;
  initialAnswers?: Partial<Record<QuestionKey, number>>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function RiskWizard({ onComplete, initialAnswers = {} }: RiskWizardProps) {
  const t = useTranslations('riskWizard');

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<QuestionKey, number>>>(initialAnswers);
  const [result, setResult] = useState<RiskProfile | null>(null);
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  const currentKey = QUESTION_KEYS[step];
  const totalSteps = QUESTION_KEYS.length;

  // Build options array from i18n
  const getOptions = (key: QuestionKey): string[] => {
    const raw = t.raw(`questions.${key}Options`) as string[];
    return raw;
  };

  const handleSelect = useCallback(
    (idx: number) => setAnswers(prev => ({ ...prev, [currentKey]: idx })),
    [currentKey],
  );

  const handleNext = useCallback(() => {
    if (answers[currentKey] === undefined) return;

    if (step < totalSteps - 1) {
      setStep(s => s + 1);
      return;
    }

    // Final step — calculate score
    let score = 0;
    for (const key of QUESTION_KEYS) {
      const answer = answers[key] ?? 0;
      // Each question has 4 options (0–3). Normalise to 0–100 per question.
      const normalised = (answer / 3) * 100;
      score += normalised * WEIGHTS[key];
    }

    const rounded = Math.round(score);
    const label = scoreToLabel(rounded);

    const profile: RiskProfile = {
      user_id:      null,
      score:        rounded,
      label,
      answers:      answers as Record<string, number>,
      completed_at: new Date().toISOString(),
    };

    setResult(profile);
    onComplete?.(profile);
  }, [answers, currentKey, step, totalSteps, onComplete]);

  const handlePrev = useCallback(() => setStep(s => Math.max(0, s - 1)), []);

  // -------------------------------------------------------------------------
  // Result screen
  // -------------------------------------------------------------------------
  if (result) {
    const colorClass = LABEL_COLORS[result.label];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-6"
      >
        {/* Label badge */}
        <div className={`rounded-2xl border-2 px-8 py-6 text-center ${colorClass}`}>
          <p className="text-sm text-gray-400 mb-1">{t('title')}</p>
          <p className="text-3xl font-bold">{t(`result.${result.label}`)}</p>
          <p className="text-sm mt-2 opacity-80">{t(`resultDescription.${result.label}`)}</p>
          <p className="text-xs mt-3 opacity-60">Score: {result.score} / 100</p>
        </div>

        {/* Recommendations */}
        <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-5 space-y-3 text-sm text-gray-300">
          {result.label === 'conservative' && (
            <>
              <p>• استثمر في صكوك الحكومة والأسهم ذات الأرباح الثابتة.</p>
              <p>• خصص 60-70% من محفظتك لأصول منخفضة المخاطر.</p>
              <p>• راجع محفظتك سنوياً مع مستشارك المالي.</p>
            </>
          )}
          {result.label === 'moderate' && (
            <>
              <p>• وازن بين الأسهم (50%) والأصول الثابتة (50%).</p>
              <p>• فكّر في الصناديق المتوازنة المتوافقة مع الشريعة.</p>
              <p>• أعِد توازن محفظتك كل 6 أشهر.</p>
            </>
          )}
          {result.label === 'aggressive' && (
            <>
              <p>• ركّز على أسهم النمو والقطاعات الناشئة الحلال.</p>
              <p>• قد تصل نسبة الأسهم إلى 80-90% من محفظتك.</p>
              <p>• تابع الأسواق بانتظام وحدّد نقاط وقف الخسارة.</p>
            </>
          )}
        </div>

        {/* Expandable methodology */}
        <div className="rounded-xl border border-gray-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setMethodologyOpen(o => !o)}
            className="w-full flex justify-between items-center px-5 py-3 text-sm text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-expanded={methodologyOpen}
          >
            <span>{t('howCalculated')}</span>
            <span aria-hidden="true">{methodologyOpen ? '▲' : '▼'}</span>
          </button>
          {methodologyOpen && (
            <div className="px-5 pb-4 text-sm text-gray-400">
              {t('howCalculatedText')}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 leading-relaxed">{t('disclaimer')}</p>

        {/* Retake */}
        <button
          type="button"
          onClick={() => { setResult(null); setStep(0); setAnswers({}); }}
          className="min-h-[44px] w-full rounded-xl border border-gray-600 text-gray-400 hover:border-gray-400 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {t('retake')}
        </button>
      </motion.div>
    );
  }

  // -------------------------------------------------------------------------
  // Wizard steps
  // -------------------------------------------------------------------------
  const question = t(`questions.${currentKey}`);
  const options  = getOptions(currentKey);

  return (
    <WizardStep
      stepNumber={step + 1}
      totalSteps={totalSteps}
      question={question}
      options={options}
      selectedIndex={answers[currentKey] ?? null}
      onSelect={handleSelect}
      onNext={handleNext}
      onPrev={handlePrev}
      isFirst={step === 0}
      isLast={step === totalSteps - 1}
    />
  );
}
