/**
 * Language switcher — toggles between Arabic (ar) and English (en).
 * Enhanced dark theme styling.
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
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    router.push(newPath);
  }

  return (
    <button
      onClick={switchLocale}
      className="text-sm font-semibold text-gray-400 hover:text-[#C5A059] px-3 py-1.5 rounded-lg border border-[#2A2A2A] hover:border-[#C5A059]/40 transition-all duration-200"
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
