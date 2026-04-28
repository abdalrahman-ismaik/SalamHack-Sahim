import { cookies } from 'next/headers';
import type { UserTier, UserSession } from './types';
import { GUEST_SESSION } from './types';

// Re-export for consumers that import from here
export type { UserTier, UserSession };
export { GUEST_SESSION };

// ---------------------------------------------------------------------------
// Constants (server-only)
// ---------------------------------------------------------------------------

const VALID_TIERS: UserTier[] = ['guest', 'free', 'pro', 'enterprise'];
const VALID_LOCALES = ['ar', 'en'] as const;

// ---------------------------------------------------------------------------
// Server-side helper — reads JWT from httpOnly cookie and decodes claims.
// No signature verification (backend is authoritative).
// ---------------------------------------------------------------------------

export function getUserFromCookie(): UserSession {
  try {
    const cookieStore = cookies();
    const cookieName = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? 'auth_token';
    const token = cookieStore.get(cookieName)?.value;
    if (!token) return GUEST_SESSION;

    // Decode payload (base64url middle segment) — no verify
    const parts = token.split('.');
    // Non-JWT marker (e.g. 'firebase') → authenticated free user;
    // actual tier is hydrated client-side from localStorage.
    if (parts.length !== 3) {
      return { id: null, name: null, locale: 'ar', tier: 'free' };
    }

    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
    );

    const rawTier   = payload.tier   as unknown;
    const rawLocale = payload.locale as unknown;

    const tier: UserTier =
      typeof rawTier === 'string' && VALID_TIERS.includes(rawTier as UserTier)
        ? (rawTier as UserTier)
        : 'guest';

    const locale: 'ar' | 'en' =
      typeof rawLocale === 'string' && VALID_LOCALES.includes(rawLocale as 'ar' | 'en')
        ? (rawLocale as 'ar' | 'en')
        : 'ar';

    return {
      id:     typeof payload.sub  === 'string' ? payload.sub  : null,
      name:   typeof payload.name === 'string' ? payload.name : null,
      locale,
      tier,
    };
  } catch {
    return GUEST_SESSION;
  }
}
