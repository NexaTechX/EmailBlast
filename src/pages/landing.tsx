import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTASection } from "@/components/landing/cta-section";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
        <span className="text-sm font-bold">E</span>
      </div>
      <span className="text-[15px] font-semibold tracking-tight">EmailBlast</span>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => navigate(user ? "/app" : "/auth");
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const footerNav = {
    Product: ["Features", "Pricing", "Changelog", "Integrations"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Resources: ["Docs", "Guides", "Support", "Status"],
    Legal: ["Privacy", "Terms", "Security"],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6 lg:px-8">
          <button onClick={() => navigate("/")} className="cursor-pointer">
            <Wordmark />
          </button>
          <nav className="ml-12 hidden items-center gap-8 md:flex">
            {[
              { label: "Features", action: () => scrollTo("features") },
              { label: "Pricing", action: () => navigate("/pricing") },
              { label: "Customers", action: () => scrollTo("customers") },
              { label: "About", action: () => navigate("/about") },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex flex-1 items-center justify-end gap-2">
            <ThemeToggle />
            {user ? (
              <Button variant="outline" size="sm" onClick={() => navigate("/app")}>
                Dashboard
              </Button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="hidden px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Sign in
                </button>
                <Button size="sm" onClick={handleGetStarted}>
                  Start for free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

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

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
            <div className="col-span-2">
              <Wordmark />
              <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
                The email platform for teams who take their craft seriously.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="font-mono">All systems operational</span>
              </div>
            </div>
            {Object.entries(footerNav).map(([group, items]) => (
              <div key={group}>
                <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {group}
                </h4>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li key={item}>
                      <span className="cursor-pointer text-sm text-foreground/70 transition-colors hover:text-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t pt-8 sm:flex-row sm:items-center">
            <p className="font-mono text-xs text-muted-foreground">
              © {new Date().getFullYear()} EmailBlast, Inc.
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Made for marketers who move fast.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
