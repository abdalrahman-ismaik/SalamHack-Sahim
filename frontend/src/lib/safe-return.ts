/**
 * Validate and return a same-origin returnTo path.
 * Prevents open-redirect attacks while staying safe for client components.
 */
export function safeReturnTo(raw: string | null, origin: string): string {
  if (!raw) return '';

  try {
    const url = new URL(decodeURIComponent(raw), origin);
    return url.origin === origin ? url.pathname + url.search : '';
  } catch {
    return '';
  }
}
