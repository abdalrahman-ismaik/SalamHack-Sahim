import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '$ahim (سهم) — Smart Investing for Arabic-Speaking Beginners',
  description: 'AI-powered investment intelligence platform for beginner Arabic investors, covering MENA stocks.',
};

// Root layout must exist for Next.js, but html/body are in [locale]/layout.tsx
// so that lang and dir can be set dynamically per locale.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children as React.ReactElement;
}
