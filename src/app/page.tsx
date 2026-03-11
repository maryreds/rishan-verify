import LandingNav from "@/components/landing/landing-nav";
import HeroSection from "@/components/landing/hero-section";
import StatsBar from "@/components/landing/stats-bar";
import FloatingGallery from "@/components/landing/floating-gallery";
import HowItWorks from "@/components/landing/how-it-works";
import FeaturesSection from "@/components/landing/features-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import CtaSection from "@/components/landing/cta-section";
import LandingFooter from "@/components/landing/landing-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <LandingNav />
      <HeroSection />
      <StatsBar />

      {/* Verified Professionals Gallery */}
      <section className="relative py-16 lg:py-20">
        <div className="text-center mb-10 relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            500+ professionals verified and counting
          </p>
        </div>
        <FloatingGallery />
      </section>

      <HowItWorks />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
