'use client';

import type { RiskProfile } from '@/lib/types';

export const RISK_PROFILE_STORAGE_KEY = 'ahim_risk_profile';

export function getStoredRiskProfile(): RiskProfile | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(RISK_PROFILE_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as RiskProfile;
  } catch {
    return null;
  }
}

export function setStoredRiskProfile(profile: RiskProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RISK_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
