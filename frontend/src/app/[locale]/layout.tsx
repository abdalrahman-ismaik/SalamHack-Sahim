import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { notFound } from "next/navigation";
import UserProvider from "@/providers/UserProvider";
import { TierRefreshBanner } from "@/components/ui/TierRefreshBanner";
import "../globals.css";

const locales = ["ar", "en"] as const;
type Locale = (typeof locales)[number];

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "سهم — تحليل استثماري ذكي",
  description: "تحليل معلوماتي مستقل للأسهم في الأسواق العربية",
};

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = useMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cairo.variable} ${inter.variable}`}
    >
      <body className="font-arabic bg-gray-50 text-gray-900 min-h-screen">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <UserProvider>
            <TierRefreshBanner />
            {children}
          </UserProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
