import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const locales = ["ar", "en"] as const;
const defaultLocale = "ar";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

// Routes that never require authentication
const PUBLIC_PATTERNS = [
  /^\/[a-z]{2}$/,                        // /ar  /en  (landing)
  /^\/[a-z]{2}\/(auth)(\/|$)/,           // /ar/auth/...
  /^\/[a-z]{2}\/stock\/.+/,             // /ar/stock/AAPL — soft gate at page level
  /^\/_next\//,                          // Next.js internals
  /^\/favicon/,                          // favicon
  /^\/api\//,                            // API routes
];

/**
 * Validate and return a same-origin returnTo path.
 * Prevents open-redirect attacks (OWASP A01).
 */
export function safeReturnTo(raw: string | null, origin: string): string {
  if (!raw) return "";
  try {
    const url = new URL(decodeURIComponent(raw), origin);
    return url.origin === origin ? url.pathname + url.search : "";
  } catch {
    return "";
  }
}

export function middleware(request: NextRequest) {
  // 1. Always run i18n middleware first
  const intlResponse = intlMiddleware(request);

  // 2. Determine actual pathname (after potential intl rewrite)
  const pathname = request.nextUrl.pathname;

  // 3. Skip auth check for public routes
  const isPublic = PUBLIC_PATTERNS.some((pattern) => pattern.test(pathname));
  if (isPublic) return intlResponse;

  // 4. Check for auth cookie
  const token = request.cookies.get(
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "auth_token"
  );
  if (token) return intlResponse;

  // 5. Redirect unauthenticated users — preserve locale from pathname
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : defaultLocale;
  const returnTo = encodeURIComponent(pathname);
  const signinUrl = new URL(
    `/${locale}/auth/signin?returnTo=${returnTo}`,
    request.url
  );
  return NextResponse.redirect(signinUrl);
}

export const config = {
  matcher: [
    // Match all pathnames except for api routes, _next, static files
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
