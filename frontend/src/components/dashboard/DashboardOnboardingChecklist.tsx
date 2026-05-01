'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import Stepper, { Step } from '@/components/ui/Stepper';
import { UserContext } from '@/providers/UserContext';
import { auth, db } from '@/lib/firebase';
import { getStoredProfile, setStoredProfile } from '@/lib/firebase-session';
import { setStoredRiskProfile } from '@/lib/risk-profile-storage';
import type { RiskLabel, RiskProfile } from '@/lib/types';

type RiskQuestionKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6';
type RiskBehaviorQuestionKey = 'q2' | 'q5' | 'q6';

interface OnboardingProfile {
  name: string;
  country: string;
  ageRange: string;
  baseCurrency: string;
  objective: string;
  experience: string;
  timeHorizon: string;
  liquidityNeeds: string;
  relianceOnFunds: string;
  halalPreference: string;
  preferredMarkets: string[];
  interestedSectors: string[];
  newsCadence: string;
  riskAnswers: Record<RiskQuestionKey, number>;
}

const ONBOARDING_PROFILE_KEY = 'sahim_investor_profile';
const ONBOARDING_VERSION = 'dashboard-stepper-2026-05';
const RISK_KEYS: RiskQuestionKey[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
const RISK_BEHAVIOR_KEYS: RiskBehaviorQuestionKey[] = ['q2', 'q5', 'q6'];
const RISK_WEIGHTS: Record<RiskQuestionKey, number> = {
  q1: 0.25,
  q2: 0.20,
  q3: 0.15,
  q4: 0.15,
  q5: 0.15,
  q6: 0.10,
};

const COUNTRY_OPTIONS = ['sa', 'ae', 'eg', 'qa', 'kw', 'bh', 'om', 'us', 'other'];
const CURRENCY_OPTIONS = ['SAR', 'AED', 'USD', 'EGP', 'QAR', 'KWD', 'BHD', 'OMR'];
const AGE_OPTIONS = ['under25', '25to40', '41to55', 'over55'];
const OBJECTIVE_OPTIONS = ['learn', 'preserve', 'balanced', 'income', 'growth'];
const EXPERIENCE_OPTIONS = ['beginner', 'some', 'confident', 'advanced'];
const HORIZON_OPTIONS = ['under1', '1to3', '3to7', 'over7'];
const LIQUIDITY_OPTIONS = ['high', 'medium', 'low'];
const RELIANCE_OPTIONS = ['essential', 'important', 'flexible', 'surplus'];
const HALAL_OPTIONS = ['strict', 'balanced', 'informational'];
const MARKET_OPTIONS = ['tadawul', 'adx', 'dfm', 'egx', 'us', 'global'];
const SECTOR_OPTIONS = ['technology', 'financials', 'healthcare', 'energy', 'consumer', 'industrials', 'realEstate', 'materials'];
const NEWS_OPTIONS = ['marketOpen', 'daily', 'weekly', 'alertsOnly'];

const HORIZON_TO_RISK_ANSWER: Record<string, number> = {
  under1: 0,
  '1to3': 1,
  '3to7': 2,
  over7: 3,
};

const AGE_TO_RISK_ANSWER: Record<string, number> = {
  under25: 0,
  '25to40': 1,
  '41to55': 2,
  over55: 3,
};

const EXPERIENCE_TO_RISK_ANSWER: Record<string, number> = {
  beginner: 0,
  some: 1,
  confident: 2,
  advanced: 3,
};

const DEFAULT_PROFILE: OnboardingProfile = {
  name: '',
  country: 'sa',
  ageRange: '25to40',
  baseCurrency: 'SAR',
  objective: 'balanced',
  experience: 'beginner',
  timeHorizon: '3to7',
  liquidityNeeds: 'medium',
  relianceOnFunds: 'flexible',
  halalPreference: 'strict',
  preferredMarkets: ['tadawul', 'us'],
  interestedSectors: ['technology', 'healthcare', 'energy'],
  newsCadence: 'daily',
  riskAnswers: {
    q1: 2,
    q2: 1,
    q3: 1,
    q4: 0,
    q5: 2,
    q6: 2,
  },
};

function completionKey(uid: string) {
  return `sahim_onboarding_completed_${uid}`;
}

function draftKey(uid: string) {
  return `sahim_onboarding_draft_${uid}`;
}

function riskLabel(score: number): RiskLabel {
  if (score <= 40) return 'conservative';
  if (score <= 70) return 'moderate';
  return 'aggressive';
}

function buildRiskProfile(uid: string, answers: Record<RiskQuestionKey, number>): RiskProfile {
  const score = RISK_KEYS.reduce((total, key) => {
    const normalised = ((answers[key] ?? 0) / 3) * 100;
    return total + normalised * RISK_WEIGHTS[key];
  }, 0);

  const rounded = Math.round(score);
  return {
    user_id: uid,
    score: rounded,
    label: riskLabel(rounded),
    answers,
    completed_at: new Date().toISOString(),
  };
}

function riskAnswersFromProfile(profile: OnboardingProfile): Record<RiskQuestionKey, number> {
  return {
    ...profile.riskAnswers,
    q1: HORIZON_TO_RISK_ANSWER[profile.timeHorizon] ?? profile.riskAnswers.q1,
    q3: AGE_TO_RISK_ANSWER[profile.ageRange] ?? profile.riskAnswers.q3,
    q4: EXPERIENCE_TO_RISK_ANSWER[profile.experience] ?? profile.riskAnswers.q4,
  };
}

function useOptionLabels(namespace: string, keys: string[]) {
  const t = useTranslations(namespace);
  return useMemo(() => keys.map(value => ({ value, label: t(value) })), [keys, t]);
}

export function DashboardOnboardingChecklist() {
  const locale = useLocale();
  const t = useTranslations('dashboard.onboarding');
  const riskT = useTranslations('riskWizard');
  const session = useContext(UserContext);
  const [uid, setUid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<OnboardingProfile>(DEFAULT_PROFILE);

  const countryOptions = useOptionLabels('dashboard.onboarding.options.country', COUNTRY_OPTIONS);
  const currencyOptions = useMemo(() => CURRENCY_OPTIONS.map(value => ({ value, label: value })), []);
  const ageOptions = useOptionLabels('dashboard.onboarding.options.age', AGE_OPTIONS);
  const objectiveOptions = useOptionLabels('dashboard.onboarding.options.objective', OBJECTIVE_OPTIONS);
  const experienceOptions = useOptionLabels('dashboard.onboarding.options.experience', EXPERIENCE_OPTIONS);
  const horizonOptions = useOptionLabels('dashboard.onboarding.options.horizon', HORIZON_OPTIONS);
  const liquidityOptions = useOptionLabels('dashboard.onboarding.options.liquidity', LIQUIDITY_OPTIONS);
  const relianceOptions = useOptionLabels('dashboard.onboarding.options.reliance', RELIANCE_OPTIONS);
  const halalOptions = useOptionLabels('dashboard.onboarding.options.halal', HALAL_OPTIONS);
  const marketOptions = useOptionLabels('dashboard.onboarding.options.market', MARKET_OPTIONS);
  const sectorOptions = useOptionLabels('dashboard.onboarding.options.sector', SECTOR_OPTIONS);
  const newsOptions = useOptionLabels('dashboard.onboarding.options.news', NEWS_OPTIONS);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) {
        setChecking(false);
        setOpen(false);
        return;
      }

      setUid(user.uid);

      const storedProfile = getStoredProfile();
      const displayName = user.displayName ?? session.name ?? storedProfile.name ?? '';
      const draft = localStorage.getItem(draftKey(user.uid));
      if (draft) {
        try {
          const parsed = JSON.parse(draft) as Partial<OnboardingProfile>;
          setProfile(prev => ({
            ...prev,
            ...parsed,
            name: (((parsed.name ?? prev.name) || displayName)).trim(),
          }));
        } catch {
          setProfile(prev => ({
            ...prev,
            name: prev.name || displayName,
          }));
        }
      } else {
        setProfile(prev => ({
          ...prev,
          name: prev.name || displayName,
        }));
      }

      if (localStorage.getItem(completionKey(user.uid)) === '1') {
        setChecking(false);
        setOpen(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        const data = snapshot.exists() ? snapshot.data() : null;

        if (data?.onboarding?.completedAt) {
          localStorage.setItem(completionKey(user.uid), '1');
          setOpen(false);
        } else {
          setOpen(true);
        }
      } catch {
        setOpen(true);
      } finally {
        setChecking(false);
      }
    });

    return unsubscribe;
  }, [session.name]);

  const setField = <Key extends keyof OnboardingProfile>(field: Key, value: OnboardingProfile[Key]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleListValue = (field: 'preferredMarkets' | 'interestedSectors', value: string) => {
    setProfile(prev => {
      const current = prev[field];
      const next = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];

      return {
        ...prev,
        [field]: next.length ? next : current,
      };
    });
  };

  const updateRiskAnswer = (key: RiskBehaviorQuestionKey, value: number) => {
    setProfile(prev => ({
      ...prev,
      riskAnswers: {
        ...prev.riskAnswers,
        [key]: value,
      },
    }));
  };

  useEffect(() => {
    if (!uid || !open) return;
    localStorage.setItem(draftKey(uid), JSON.stringify(profile));
  }, [uid, open, profile]);

  const canProceed = useMemo(() => {
    if (currentStep === 1) {
      return (
        profile.name.trim().length > 1 &&
        Boolean(profile.country) &&
        Boolean(profile.ageRange) &&
        Boolean(profile.baseCurrency)
      );
    }
    if (currentStep === 2) {
      return (
        Boolean(profile.objective) &&
        Boolean(profile.experience) &&
        Boolean(profile.timeHorizon) &&
        Boolean(profile.liquidityNeeds) &&
        Boolean(profile.relianceOnFunds) &&
        Boolean(profile.halalPreference)
      );
    }
    if (currentStep === 3) {
      return (
        profile.preferredMarkets.length > 0 &&
        profile.interestedSectors.length > 0 &&
        Boolean(profile.newsCadence)
      );
    }
    if (currentStep === 4) {
      return RISK_BEHAVIOR_KEYS.every(key => {
        const answer = profile.riskAnswers[key];
        return Number.isFinite(answer) && answer >= 0 && answer <= 3;
      });
    }
    return true;
  }, [currentStep, profile]);

  const completeOnboarding = async () => {
    if (!uid) return;

    setSaving(true);
    setError(null);

    const riskAnswers = riskAnswersFromProfile(profile);
    const riskProfile = buildRiskProfile(uid, riskAnswers);
    const completedAt = new Date().toISOString();
    const investmentProfile = {
      ...profile,
      riskAnswers,
      locale,
      completedAt,
      version: ONBOARDING_VERSION,
      riskScore: riskProfile.score,
      riskLabel: riskProfile.label,
    };

    localStorage.setItem(`${ONBOARDING_PROFILE_KEY}_${uid}`, JSON.stringify(investmentProfile));
    localStorage.setItem(completionKey(uid), '1');
    setStoredProfile({ name: profile.name, photoURL: session.photoURL ?? getStoredProfile().photoURL });
    setStoredRiskProfile(riskProfile);

    try {
      const userRef = doc(db, 'users', uid);
      const riskRef = doc(db, 'users', uid, 'risk_profile', 'current');

      await Promise.all([
        setDoc(userRef, {
          name: profile.name,
          country: profile.country,
          ageRange: profile.ageRange,
          baseCurrency: profile.baseCurrency,
          investmentProfile,
          onboarding: {
            completedAt,
            version: ONBOARDING_VERSION,
          },
          riskProfile: String(riskProfile.score),
          riskProfileLabel: riskProfile.label,
          riskProfileAnswers: riskProfile.answers,
          riskProfileCompletedAt: riskProfile.completed_at,
        }, { merge: true }),
        setDoc(riskRef, riskProfile, { merge: true }),
      ]);

      localStorage.removeItem(draftKey(uid));
      setOpen(false);
      setCurrentStep(1);
    } catch {
      localStorage.removeItem(completionKey(uid));
      setError(t('saveError'));
      throw new Error('Failed to save onboarding profile');
    } finally {
      setSaving(false);
    }
  };

  if (checking || !open) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/82 px-4 py-6 backdrop-blur-md">
      <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center">
        <div className="w-full">
          <div className="mx-auto mb-4 max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C5A059]/30 bg-[#C5A059]/15 text-[#F0D590]">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C5A059]">{t('eyebrow')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{t('title')}</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">{t('subtitle')}</p>
          </div>

          <Stepper
            disableStepIndicators
            onStepChange={setCurrentStep}
            backButtonText={t('actions.back')}
            nextButtonText={t('actions.next')}
            completeButtonText={saving ? t('actions.saving') : t('actions.complete')}
            onFinalStepCompleted={completeOnboarding}
            nextButtonProps={{ disabled: saving || !canProceed }}
          >
            <Step>
              <section className="space-y-5">
                <StepHeading icon={<UserRound className="h-5 w-5" />} title={t('steps.identity.title')} body={t('steps.identity.body')} />
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label={t('fields.name')} value={profile.name} onChange={value => setField('name', value)} />
                  <SelectField label={t('fields.country')} value={profile.country} options={countryOptions} onChange={value => setField('country', value)} />
                  <SelectField label={t('fields.age')} value={profile.ageRange} options={ageOptions} onChange={value => setField('ageRange', value)} />
                  <SelectField label={t('fields.currency')} value={profile.baseCurrency} options={currencyOptions} onChange={value => setField('baseCurrency', value)} />
                </div>
              </section>
            </Step>

            <Step>
              <section className="space-y-5">
                <StepHeading icon={<ShieldCheck className="h-5 w-5" />} title={t('steps.suitability.title')} body={t('steps.suitability.body')} />
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField label={t('fields.objective')} value={profile.objective} options={objectiveOptions} onChange={value => setField('objective', value)} />
                  <SelectField label={t('fields.experience')} value={profile.experience} options={experienceOptions} onChange={value => setField('experience', value)} />
                  <SelectField label={t('fields.horizon')} value={profile.timeHorizon} options={horizonOptions} onChange={value => setField('timeHorizon', value)} />
                  <SelectField label={t('fields.liquidity')} value={profile.liquidityNeeds} options={liquidityOptions} onChange={value => setField('liquidityNeeds', value)} />
                  <SelectField label={t('fields.reliance')} value={profile.relianceOnFunds} options={relianceOptions} onChange={value => setField('relianceOnFunds', value)} />
                  <SelectField label={t('fields.halal')} value={profile.halalPreference} options={halalOptions} onChange={value => setField('halalPreference', value)} />
                </div>
              </section>
            </Step>

            <Step>
              <section className="space-y-5">
                <StepHeading icon={<Sparkles className="h-5 w-5" />} title={t('steps.preferences.title')} body={t('steps.preferences.body')} />
                <ChipGroup label={t('fields.markets')} options={marketOptions} selected={profile.preferredMarkets} onToggle={value => toggleListValue('preferredMarkets', value)} />
                <ChipGroup label={t('fields.sectors')} options={sectorOptions} selected={profile.interestedSectors} onToggle={value => toggleListValue('interestedSectors', value)} />
                <SelectField label={t('fields.newsCadence')} value={profile.newsCadence} options={newsOptions} onChange={value => setField('newsCadence', value)} />
              </section>
            </Step>

            <Step>
              <section className="space-y-5">
                <StepHeading icon={<ShieldCheck className="h-5 w-5" />} title={t('steps.risk.title')} body={t('steps.risk.body')} />
                <div className="rounded-2xl border border-[#C5A059]/20 bg-[#C5A059]/10 px-4 py-3 text-xs leading-6 text-[#F0D590]/88">
                  {t('steps.risk.derived')}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {RISK_BEHAVIOR_KEYS.map(key => {
                    const options = riskT.raw(`questions.${key}Options`) as string[];
                    return (
                      <SelectField
                        key={key}
                        label={riskT(`questions.${key}`)}
                        value={String(profile.riskAnswers[key])}
                        options={options.map((label, index) => ({ value: String(index), label }))}
                        onChange={value => updateRiskAnswer(key, Number(value))}
                      />
                    );
                  })}
                </div>
              </section>
            </Step>

            <Step>
              <section className="space-y-5">
                <StepHeading icon={<ShieldCheck className="h-5 w-5" />} title={t('steps.review.title')} body={t('steps.review.body')} />
                <div className="grid gap-3 md:grid-cols-2">
                  <ReviewItem label={t('review.profile')} value={`${profile.name || t('review.unnamed')} · ${profile.baseCurrency}`} />
                  <ReviewItem label={t('review.location')} value={`${t(`options.country.${profile.country}`)} · ${t(`options.age.${profile.ageRange}`)}`} />
                  <ReviewItem label={t('review.objective')} value={t(`options.objective.${profile.objective}`)} />
                  <ReviewItem label={t('review.markets')} value={profile.preferredMarkets.map(value => t(`options.market.${value}`)).join(', ')} />
                  <ReviewItem label={t('review.sectors')} value={profile.interestedSectors.map(value => t(`options.sector.${value}`)).join(', ')} />
                  <ReviewItem label={t('review.risk')} value={riskT(`result.${buildRiskProfile(uid ?? '', riskAnswersFromProfile(profile)).label}`)} />
                </div>
                <p className="rounded-2xl border border-[#C5A059]/20 bg-[#C5A059]/10 px-4 py-3 text-xs leading-6 text-[#F0D590]/88">
                  {t('disclaimer')}
                </p>
                {error && (
                  <p role="alert" className="rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </p>
                )}
              </section>
            </Step>
          </Stepper>
        </div>
      </div>
    </div>
  );
}

function StepHeading({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#C5A059]/25 bg-[#C5A059]/12 text-[#F0D590]">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-white/55">{body}</p>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/45">{label}</span>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#C5A059]/45 focus:bg-white/[0.08]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/45">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 text-sm text-white outline-none transition-colors focus:border-[#C5A059]/45"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/45">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(option => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'border-[#C5A059]/45 bg-[#C5A059]/18 text-[#F0D590]'
                  : 'border-white/10 bg-white/[0.045] text-white/55 hover:border-white/20 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/38">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
