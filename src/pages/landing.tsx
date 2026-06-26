import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTASection } from "@/components/landing/cta-section";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleGetStarted = () => navigate(user ? "/app" : "/auth");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-16">
        <Hero onGetStarted={handleGetStarted} />
        <SocialProof />
        <div id="features">
          <Features />
        </div>
        <HowItWorks />
        <div id="customers">
          <Testimonials />
        </div>
        <FAQ />
        <CTASection onGetStarted={handleGetStarted} />
      </main>
      <SiteFooter />
    </div>
  );
}
