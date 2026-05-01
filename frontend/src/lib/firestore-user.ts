'use client';

import type { User } from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ClientTier } from '@/lib/firebase-session';
import type { UserProfile, ZakatMetadata, ZakatResult } from '@/lib/types';

interface EnsureUserOptions {
  tier?: ClientTier;
  locale?: 'ar' | 'en';
  email?: string | null;
  name?: string | null;
  photoURL?: string | null;
}

export function userDocumentPath(uid: string): string {
  return `users/${uid}`;
}

function cleanPatch<T extends Record<string, unknown>>(patch: T): DocumentData {
  return Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  );
}

function safeUserPatch(patch: Record<string, unknown>): DocumentData {
  const { tier: _tier, ...rest } = patch;
  return cleanPatch(rest);
}

export function sanitizeZakatMetadata(
  result: ZakatResult,
  calculatedAt = new Date().toISOString(),
): ZakatMetadata {
  return {
    nisab_value: result.nisab_value,
    nisab_source: result.nisab_source,
    gold_price_date: result.gold_price_date,
    zakat_due: result.zakat_due,
    below_nisab: result.below_nisab,
    currency: result.currency,
    calculated_at: calculatedAt,
  };
}

export async function getUserProfileDocument(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

export async function ensureUserDocument(
  user: User,
  options: EnsureUserOptions = {},
): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);

  await setDoc(
    ref,
    cleanPatch({
      email: options.email ?? user.email ?? null,
      name: options.name ?? user.displayName ?? null,
      photoURL: options.photoURL ?? user.photoURL ?? null,
      tier: snapshot.exists() ? undefined : 'free',
      locale: options.locale ?? 'ar',
      watchlistCount: snapshot.exists() ? undefined : 0,
      halalComplianceRate: snapshot.exists() ? undefined : null,
      createdAt: snapshot.exists() ? undefined : serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
}

export async function mergeUserDocument(
  uid: string,
  patch: Record<string, unknown>,
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    safeUserPatch({
      ...patch,
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
}

export async function saveLastViewedTicker(uid: string, ticker: string): Promise<void> {
  const normalized = ticker.trim().toUpperCase();
  if (!normalized) return;

  await mergeUserDocument(uid, {
    lastViewedTicker: normalized,
    lastViewedAt: new Date().toISOString(),
  });
}

export async function saveLastZakatResult(
  uid: string,
  result: ZakatResult,
): Promise<void> {
  const calculatedAt = new Date().toISOString();

  await mergeUserDocument(uid, {
    lastZakatDate: calculatedAt,
    lastZakatResult: sanitizeZakatMetadata(result, calculatedAt),
  });
}
