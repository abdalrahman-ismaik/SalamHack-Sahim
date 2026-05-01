'use client';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { mergeUserDocument } from '@/lib/firestore-user';
import type { HalalStatus, WatchlistItem } from '@/lib/types';

export function normalizeWatchlistTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

async function refreshWatchlistCount(uid: string): Promise<void> {
  const snapshot = await getDocs(collection(db, 'users', uid, 'watchlist'));
  await mergeUserDocument(uid, {
    watchlistCount: snapshot.size,
  });
}

export async function listWatchlistTickers(uid: string): Promise<string[]> {
  const snapshot = await getDocs(collection(db, 'users', uid, 'watchlist'));
  return snapshot.docs
    .map(item => normalizeWatchlistTicker(item.id))
    .filter(Boolean)
    .sort();
}

export async function saveWatchlistItem(
  uid: string,
  item: {
    ticker: string;
    name?: string | null;
    exchange?: string | null;
    halalStatus?: HalalStatus | null;
  },
): Promise<void> {
  const ticker = normalizeWatchlistTicker(item.ticker);
  if (!ticker) return;

  const ref = doc(db, 'users', uid, 'watchlist', ticker);
  const now = new Date().toISOString();
  const payload: WatchlistItem = {
    ticker,
    name: item.name ?? null,
    exchange: item.exchange ?? null,
    halalStatus: item.halalStatus ?? null,
    addedAt: now,
    updatedAt: now,
  };

  await setDoc(
    ref,
    {
      ...payload,
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  await refreshWatchlistCount(uid);
}

export async function removeWatchlistItem(uid: string, ticker: string): Promise<void> {
  const normalized = normalizeWatchlistTicker(ticker);
  if (!normalized) return;

  await deleteDoc(doc(db, 'users', uid, 'watchlist', normalized));
  await refreshWatchlistCount(uid);
}
