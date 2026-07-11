import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { useAuth } from "@/lib/auth";

const betaFeatures = [
  "Up to 200 subscribers",
  "100 emails per month",
  "Unlimited campaigns during beta",
  "Subscriber lists + CSV import",
  "Rich text campaign editor",
  "Open & click tracking",
  "A/B subject-line tests",
  "AI copy assistant",
  "Compliance checker",
  "Scheduled sends",
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const start = () => navigate(user ? "/app" : "/auth");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-16">
        <section className="border-b">
          <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8 lg:py-28">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Pricing
            </p>
            <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
              Free while we&apos;re in beta.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground">
              Use EmailBlast at no cost during early access. Free tier includes up
              to 200 subscribers and 100 emails per month.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-lg px-6 py-16 lg:px-8">
          <div className="rounded-xl border p-8">
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Free beta
              </p>
              <p className="mt-4 font-mono text-5xl font-semibold">$0</p>
              <p className="mt-2 text-sm text-muted-foreground">
                No credit card required
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {betaFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {f}
                </li>
              ))}
            </ul>

            <Button className="mt-8 w-full" size="lg" onClick={start}>
              {user ? "Go to dashboard" : "Join free beta"}
            </Button>
          </div>

          <div className="mt-10 rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">Pro & Enterprise — coming soon</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Higher volume, team seats, and billing will launch after the beta.
              Welcome drip automations are available now under Automations.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
