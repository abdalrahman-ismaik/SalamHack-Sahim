'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
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

function scoreFromAnswers(
  answers: Partial<Record<QuestionKey, number>>,
  normalizeByAnsweredWeight: boolean,
): number {
  let weightedScore = 0;
  let answeredWeight = 0;

  for (const key of QUESTION_KEYS) {
    const answer = answers[key];
    if (answer === undefined) continue;
    const normalised = (answer / 3) * 100;
    weightedScore += normalised * WEIGHTS[key];
    answeredWeight += WEIGHTS[key];
  }

  if (answeredWeight === 0) return 0;
  if (normalizeByAnsweredWeight) {
    return Math.round(weightedScore / answeredWeight);
  }
  return Math.round(weightedScore);
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
  onComplete?: (profile: RiskProfile) => void | Promise<void>;
  initialAnswers?: Partial<Record<QuestionKey, number>>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function RiskWizard({ onComplete, initialAnswers = {} }: RiskWizardProps) {
  const t = useTranslations('riskWizard');
  const locale = useLocale();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<QuestionKey, number>>>(initialAnswers);
  const [result, setResult] = useState<RiskProfile | null>(null);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentKey = QUESTION_KEYS[step];
  const totalSteps = QUESTION_KEYS.length;
  // Build options array from i18n
  function getOptions(key: QuestionKey): string[] {
    return t.raw(`questions.${key}Options`) as string[];
  }

  const answeredCount = QUESTION_KEYS.filter((key) => answers[key] !== undefined).length;

  const simulation = useMemo(() => {
    const score = scoreFromAnswers(answers, true);
    return {
      score,
      label: scoreToLabel(score),
    };
  }, [answers]);

  const selectedAnswerSummary = useMemo(() => {
    return QUESTION_KEYS
      .filter((key) => answers[key] !== undefined)
      .map((key) => {
        const idx = answers[key] as number;
        const options = getOptions(key);
        return {
          key,
          question: t(`questions.${key}`),
          answer: options[idx] ?? '',
        };
      });
  }, [answers, t]);

  const handleSelect = useCallback(
    (idx: number) => setAnswers(prev => ({ ...prev, [currentKey]: idx })),
    [currentKey],
  );

  const handleNext = useCallback(() => {
    if (isSaving) return;
    if (answers[currentKey] === undefined) return;

    if (step < totalSteps - 1) {
      setStep(s => s + 1);
      return;
    }

    // Final step — calculate score
    const rounded = scoreFromAnswers(answers, false);
    const label = scoreToLabel(rounded);

    const profile: RiskProfile = {
      user_id:      null,
      score:        rounded,
      label,
      answers:      answers as Record<string, number>,
      completed_at: new Date().toISOString(),
    };

    // Show computed result immediately so the user sees feedback without waiting for persistence.
    setResult(profile);
    setIsSaving(true);
    Promise.resolve()
      .then(() => onComplete?.(profile))
      .catch(() => {
        // Keep showing the calculated result even if save fails.
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [answers, currentKey, step, totalSteps, onComplete, isSaving]);

  const handlePrev = useCallback(() => setStep(s => Math.max(0, s - 1)), []);

  // -------------------------------------------------------------------------
  // Result screen
  // -------------------------------------------------------------------------
  if (result) {
    const colorClass = LABEL_COLORS[result.label];
    const equityAllocation = Math.round(20 + (result.score * 0.7));
    const sukukAllocation = Math.max(0, 100 - equityAllocation);
    const expectedMaxDrawdown = (5 + result.score * 0.25).toFixed(1);
    const monthlyVolatility = (2.5 + result.score * 0.08).toFixed(1);
    const expectedRecoveryMonths = Math.round(2 + result.score * 0.12);
    const q6Answer = result.answers?.q6;
    const behaviorHint =
      q6Answer === 0
        ? 'You are likely to react quickly to drawdowns.'
        : q6Answer === 1
          ? 'You may need short cooling-off time before deciding.'
          : q6Answer === 2
            ? 'You can usually tolerate medium-term volatility.'
            : 'You are likely to stay disciplined in downturns.';

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
          {isSaving && (
            <p className="text-[11px] mt-2 opacity-70">{t('saving')}</p>
          )}
        </div>

        {/* Mock simulation based on selected answers */}
        <div className="rounded-xl border border-[#C5A059]/25 bg-[#C5A059]/10 p-5 space-y-3 text-sm text-white/85">
          <h3 className="text-sm font-semibold text-[#F0D590]">Risk Simulation (based on your answers)</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <p>Suggested equity allocation: <span className="font-semibold">{equityAllocation}%</span></p>
            <p>Suggested sukuk/cash allocation: <span className="font-semibold">{sukukAllocation}%</span></p>
            <p>Estimated max drawdown: <span className="font-semibold">{expectedMaxDrawdown}%</span></p>
            <p>Estimated monthly volatility: <span className="font-semibold">{monthlyVolatility}%</span></p>
            <p className="sm:col-span-2">Estimated recovery window: <span className="font-semibold">{expectedRecoveryMonths} months</span></p>
            <p className="sm:col-span-2 text-white/70">{behaviorHint}</p>
          </div>
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

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={`/${locale}/dashboard`}
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#C5A059] px-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D590]"
          >
            {t('returnToDashboard')}
          </Link>

          <button
            type="button"
            onClick={() => { setResult(null); setStep(0); setAnswers({}); }}
            className="min-h-[44px] w-full rounded-xl border border-gray-600 px-4 text-sm text-gray-400 transition-colors hover:border-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {t('retake')}
          </button>
        </div>
      </motion.div>
    );
  }

  // -------------------------------------------------------------------------
  // Wizard steps
  // -------------------------------------------------------------------------
  const question = t(`questions.${currentKey}`);
  const options  = getOptions(currentKey);

  return (
    <div className="space-y-4">
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
        isSubmitting={isSaving}
      />

      {answeredCount > 0 && (
        <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">{t('simulation.title')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${LABEL_COLORS[simulation.label]}`}>
              {t(`result.${simulation.label}`)}
            </span>
            <span className="text-sm text-gray-300">
              {t('simulation.score', { score: simulation.score, answered: answeredCount, total: totalSteps })}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {selectedAnswerSummary.map((item) => (
              <li key={item.key} className="text-xs text-gray-300">
                <span className="text-gray-400">{item.question}:</span>{' '}
                <span className="text-white/90">{item.answer}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
