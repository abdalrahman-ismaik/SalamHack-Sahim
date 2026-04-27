import { NavBar } from '@/components/landing/NavBar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 px-4">
        © {new Date().getFullYear()} سهم. Not licensed investment advice.
      </footer>
    </>
  );
}
