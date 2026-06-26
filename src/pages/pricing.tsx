import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { useAuth } from "@/lib/auth";

const plans = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
    tagline: "For getting started",
    cta: "Start for free",
    featured: false,
    features: [
      "Up to 500 subscribers",
      "1,000 emails / month",
      "AI copywriter (basic)",
      "Core analytics",
      "Email support",
    ],
  },
  {
    name: "Pro",
    monthly: 29,
    annual: 23,
    tagline: "For growing teams",
    cta: "Start free trial",
    featured: true,
    features: [
      "Up to 25,000 subscribers",
      "Unlimited emails",
      "AI copywriter (advanced)",
      "Automations & segments",
      "Lead finder",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    monthly: 99,
    annual: 79,
    tagline: "For scale",
    cta: "Contact sales",
    featured: false,
    features: [
      "Unlimited subscribers",
      "Dedicated IP & warm-up",
      "SSO & advanced roles",
      "Custom integrations",
      "Dedicated manager",
      "99.9% uptime SLA",
    ],
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [annual, setAnnual] = useState(true);

  const start = () => navigate(user ? "/app" : "/auth");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-16">
        {/* Heading */}
        <section className="border-b">
          <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8 lg:py-28">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Pricing
            </p>
            <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
              Simple, transparent pricing.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground">
              Start free. Upgrade when you grow. No hidden fees, cancel anytime.
            </p>

            {/* Billing toggle */}
            <div className="mt-9 inline-flex items-center gap-3">
              <div className="inline-flex rounded-lg border p-1">
                {(["Monthly", "Annual"] as const).map((label, i) => {
                  const isAnnual = i === 1;
                  const active = annual === isAnnual;
                  return (
                    <button
                      key={label}
                      onClick={() => setAnnual(isAnnual)}
                      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <span className="font-mono text-xs text-emerald-600">Save 20%</span>
            </div>
          </div>
        </section>

        {/* Plans — ruled columns, popular inverted */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl grid-cols-1 border-x md:grid-cols-3 md:divide-x">
            {plans.map((plan) => {
              const price = annual ? plan.annual : plan.monthly;
              return (
                <div
                  key={plan.name}
                  className={`flex flex-col p-8 ${
                    plan.featured
                      ? "bg-foreground text-background"
                      : "bg-background"
                  } ${plan.featured ? "" : "border-b md:border-b-0"}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {plan.name}
                    </h3>
                    {plan.featured && (
                      <span className="rounded border border-background/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-background/80">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-1 text-sm ${
                      plan.featured ? "text-background/60" : "text-muted-foreground"
                    }`}
                  >
                    {plan.tagline}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-mono text-5xl font-semibold tabular-nums tracking-tight">
                      ${price}
                    </span>
                    <span
                      className={`font-mono text-sm ${
                        plan.featured
                          ? "text-background/60"
                          : "text-muted-foreground"
                      }`}
                    >
                      /mo
                    </span>
                  </div>

                  <Button
                    onClick={start}
                    className={`mt-6 ${
                      plan.featured
                        ? "bg-background text-foreground hover:bg-background/90"
                        : ""
                    }`}
                    variant={plan.featured ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500"
                          strokeWidth={2.5}
                        />
                        <span
                          className={
                            plan.featured ? "text-background/90" : ""
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Reassurance row */}
        <section className="border-b">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-10 font-mono text-xs text-muted-foreground lg:px-8">
            {[
              "14-day free trial",
              "No credit card to start",
              "Cancel anytime",
              "99.2% deliverability",
            ].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
