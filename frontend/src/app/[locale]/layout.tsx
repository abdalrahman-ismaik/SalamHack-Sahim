import { Inter, Baloo_Bhaijaan_2 } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import UserProvider from '@/providers/UserProvider';
import { ParticleBackground } from '@/components/ParticleBackground';
import { NavBar } from '@/components/NavBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-latin' });

const balooBhaijaan2 = Baloo_Bhaijaan_2({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-arabic',
});

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
    <html lang={locale} dir={dir}>
      <body className={`${inter.variable} ${balooBhaijaan2.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <UserProvider>
            <div className="relative min-h-screen bg-[#050505] text-white">
              <ParticleBackground />
              <NavBar />
              <div className="pt-24">
                {children}
              </div>
            </div>
          </UserProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
