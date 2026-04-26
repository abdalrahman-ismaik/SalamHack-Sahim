/**
 * Language switcher — toggles between Arabic (ar) and English (en).
 * T075
 */

"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale() {
    const next = locale === "ar" ? "en" : "ar";
    // Replace the locale prefix in the path
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    router.push(newPath);
  }

  return (
    <button
      onClick={switchLocale}
      className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
