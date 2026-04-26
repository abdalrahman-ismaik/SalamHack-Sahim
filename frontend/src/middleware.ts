import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const locales = ["ar", "en"] as const;
const defaultLocale = "ar";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export function middleware(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for api routes, _next, static files
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
