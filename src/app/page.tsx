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
    <div className="min-h-screen bg-[#06060f] text-white overflow-hidden">
      <LandingNav />
      <HeroSection />
      <StatsBar />

      {/* Floating Gallery */}
      <section className="relative py-4">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 bg-gradient-to-r from-blue-600/5 via-violet-600/8 to-emerald-600/5 blur-3xl pointer-events-none" />
        <div className="text-center mb-2 relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
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
