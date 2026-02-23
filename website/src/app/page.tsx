/**
 * Vestora Landing Page — Single-page marketing site.
 * Assembles all section components into a futuristic, scroll-driven experience.
 */
import ParticleBackground from "@/components/ParticleBackground";
import LandingNavbar from "@/components/LandingNavbar";
import HeroSection from "@/components/HeroSection";
import FeatureShowcase from "@/components/FeatureShowcase";
import HowItWorks from "@/components/HowItWorks";
import TryOnDemo from "@/components/TryOnDemo";
import StyleDNAPreview from "@/components/StyleDNAPreview";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import LandingFooter from "@/components/LandingFooter";

export default function Home() {
  return (
    <main className="relative min-h-screen mesh-bg">
      {/* Animated particle background layer */}
      <ParticleBackground />

      {/* Fixed navigation */}
      <LandingNavbar />

      {/* Page sections */}
      <HeroSection />
      <FeatureShowcase />
      <HowItWorks />
      <TryOnDemo />
      <StyleDNAPreview />
      <TestimonialCarousel />
      <PricingSection />
      <FAQSection />
      <LandingFooter />
    </main>
  );
}
