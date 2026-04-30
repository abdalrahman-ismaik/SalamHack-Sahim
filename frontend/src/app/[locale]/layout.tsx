import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import UserProvider from '@/providers/UserProvider';
import { AppChrome } from '@/components/AppChrome';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      {/* Sync dir/lang on the <html> element before first paint — no RTL flash */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.dir='${dir}';document.documentElement.lang='${locale}';`,
        }}
      />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <UserProvider>
          <AppChrome>{children}</AppChrome>
        </UserProvider>
      </NextIntlClientProvider>
    </>
  );
}
