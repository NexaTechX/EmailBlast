import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/app");
    } else {
      navigate("/auth");
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container flex h-14 items-center">
          <div
            className="flex items-center space-x-2 font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Mail className="h-6 w-6" />
            <span>EmailBlast</span>
          </div>
          <div className="flex-1" />
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" onClick={scrollToFeatures}>
              Features
            </Button>
            <Button variant="ghost" onClick={() => navigate("/pricing")}>
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => navigate("/about")}>
              About
            </Button>
            {user ? (
              <Button variant="outline" onClick={() => navigate("/app")}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={handleGetStarted}>Get Started</Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Hero onGetStarted={handleGetStarted} />
        <div id="features">
          <Features />
        </div>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Mail className="h-6 w-6" />
            <p className="text-center text-sm leading-loose md:text-left">
              EmailBlast - Built with love. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
