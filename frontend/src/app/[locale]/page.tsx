import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/landing/HeroSection';

// Split below-the-fold sections into separate JS chunks
const FeaturesSection     = dynamic(() => import('@/components/landing/FeaturesSection').then(m => ({ default: m.FeaturesSection })));
const PricingSection      = dynamic(() => import('@/components/landing/PricingSection').then(m => ({ default: m.PricingSection })));
const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const FaqSection          = dynamic(() => import('@/components/landing/FaqSection').then(m => ({ default: m.FaqSection })));
const CtaBannerSection    = dynamic(() => import('@/components/landing/CtaBannerSection').then(m => ({ default: m.CtaBannerSection })));
const NewsletterSection   = dynamic(() => import('@/components/landing/NewsletterSection').then(m => ({ default: m.NewsletterSection })));
const FooterSection       = dynamic(() => import('@/components/landing/FooterSection').then(m => ({ default: m.FooterSection })));

export default function LandingPage() {
  return (
    <main className="relative overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaBannerSection />
      <NewsletterSection />
      <FooterSection />
    </main>
  );
}
