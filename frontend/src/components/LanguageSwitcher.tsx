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
      className="flex h-11 items-center rounded-xl border border-white/10 bg-white/[0.045] px-3 text-sm font-semibold text-white/70 transition-all duration-200 hover:border-[#C5A059]/40 hover:text-[#E8D4B0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
