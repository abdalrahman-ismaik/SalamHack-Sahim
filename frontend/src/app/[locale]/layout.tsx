import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import UserProvider from '@/providers/UserProvider';
import { AppChrome } from '@/components/AppChrome';

const locales = ['ar', 'en'] as const;
const defaultLocale = 'ar';

function isSupportedLocale(locale: string): locale is (typeof locales)[number] {
  return locales.includes(locale as (typeof locales)[number]);
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const activeLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  const messages = await getMessages();
  const dir = activeLocale === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      {/* Sync dir/lang on the <html> element before first paint — no RTL flash */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.dir='${dir}';document.documentElement.lang='${activeLocale}';`,
        }}
      />
      <NextIntlClientProvider locale={activeLocale} messages={messages}>
        <UserProvider>
          <AppChrome>{children}</AppChrome>
        </UserProvider>
      </NextIntlClientProvider>
    </>
  );
}
