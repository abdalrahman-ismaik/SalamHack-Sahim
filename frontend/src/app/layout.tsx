import type { Metadata } from 'next';
import { Inter, Baloo_Bhaijaan_2 } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: '$ahim (سهم) — Smart Investing for Arabic-Speaking Beginners',
  description: 'AI-powered investment intelligence platform for beginner Arabic investors, covering MENA stocks.',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-latin' });

const balooBhaijaan2 = Baloo_Bhaijaan_2({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-arabic',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: dir/lang are set per-locale via inline script in [locale]/layout
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} ${balooBhaijaan2.variable}`}>
        {children}
      </body>
    </html>
  );
}
