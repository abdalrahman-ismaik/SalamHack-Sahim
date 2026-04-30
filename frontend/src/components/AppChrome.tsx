'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ParticleBackground } from '@/components/ParticleBackground';
import { NavBar } from '@/components/NavBar';

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = /\/dashboard(?:\/|$)/.test(pathname);

  if (isDashboard) {
    return (
      <div className="relative min-h-screen bg-[#050505] text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <ParticleBackground />
      <NavBar />
      <div className="pt-24">
        {children}
      </div>
    </div>
  );
}
