'use client';

const COOKIE_NAME =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME) ||
  'auth_token';

const TIER_KEY         = 'salam_user_tier';
const POST_SIGNIN_KEY  = 'salam_show_upgrade';
const PROFILE_NAME_KEY = 'salam_user_name';
const PROFILE_PHOTO_KEY = 'salam_user_photo_url';

// ---------------------------------------------------------------------------
// Cookie helpers (client-side only)
// ---------------------------------------------------------------------------

/** Sets a lightweight presence cookie so the middleware allows dashboard access. */
export function setAuthCookie(): void {
  const maxAge = 60 * 60 * 24; // 24 h
  document.cookie = `${COOKIE_NAME}=firebase; path=/; SameSite=Lax; max-age=${maxAge}`;
}

/** Clears the auth cookie on sign-out. */
export function clearAuthCookie(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

// ---------------------------------------------------------------------------
// Tier helpers (localStorage, client-side only)
// ---------------------------------------------------------------------------

export type ClientTier = 'free' | 'pro' | 'enterprise';

/** Returns the stored tier, defaulting to 'free' for any Firebase user. */
export function getStoredTier(): ClientTier {
  if (typeof window === 'undefined') return 'free';
  const raw = localStorage.getItem(TIER_KEY);
  if (raw === 'pro' || raw === 'enterprise') return raw;
  return 'free';
}

/** Persists the user's tier in localStorage. */
export function setStoredTier(tier: ClientTier): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TIER_KEY, tier);
  }
}

// ---------------------------------------------------------------------------
// Profile helpers (localStorage, client-side only)
// ---------------------------------------------------------------------------

export interface StoredProfile {
  name: string | null;
  photoURL: string | null;
}

export function getStoredProfile(): StoredProfile {
  if (typeof window === 'undefined') return { name: null, photoURL: null };
  return {
    name: localStorage.getItem(PROFILE_NAME_KEY),
    photoURL: localStorage.getItem(PROFILE_PHOTO_KEY),
  };
}

export function setStoredProfile(profile: StoredProfile): void {
  if (typeof window === 'undefined') return;

  const name = profile.name?.trim();
  const photoURL = profile.photoURL?.trim();

  if (name) localStorage.setItem(PROFILE_NAME_KEY, name);
  else localStorage.removeItem(PROFILE_NAME_KEY);

  if (photoURL) localStorage.setItem(PROFILE_PHOTO_KEY, photoURL);
  else localStorage.removeItem(PROFILE_PHOTO_KEY);
}

export function clearStoredProfile(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROFILE_NAME_KEY);
  localStorage.removeItem(PROFILE_PHOTO_KEY);
}

// ---------------------------------------------------------------------------
// Post-sign-in upgrade flag (sessionStorage)
// Signals the dashboard to show the upgrade modal exactly once after login.
// ---------------------------------------------------------------------------

/** Call before redirecting to dashboard after sign-in / sign-up. */
export function flagPostSignIn(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(POST_SIGNIN_KEY, '1');
  }
}

/**
 * Reads AND clears the flag in one call.
 * Returns true only once per sign-in event.
 */
export function popPostSignInFlag(): boolean {
  if (typeof window === 'undefined') return false;
  const value = sessionStorage.getItem(POST_SIGNIN_KEY);
  sessionStorage.removeItem(POST_SIGNIN_KEY);
  return value === '1';
}

// ---------------------------------------------------------------------------
// Sign-out
// ---------------------------------------------------------------------------

/**
 * Signs out from Firebase, clears all local state, and redirects to home.
 * Pass `locale` to redirect to the correct locale root (e.g. 'en' → '/en').
 */
export async function signOutAndRedirect(locale: string): Promise<void> {
  try {
    const { signOut } = await import('firebase/auth');
    const { auth }    = await import('./firebase');
    await signOut(auth);
  } catch {
    // Firebase might already be signed out; continue cleanup regardless
  }
  clearAuthCookie();
  localStorage.removeItem(TIER_KEY);
  clearStoredProfile();
  sessionStorage.removeItem(POST_SIGNIN_KEY);
  window.location.href = `/${locale}`;
}
