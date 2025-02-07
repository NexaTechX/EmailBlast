import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Up to 500 subscribers",
      "1,000 emails per month",
      "Basic templates",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    description: "Best for growing businesses",
    features: [
      "Up to 5,000 subscribers",
      "20,000 emails per month",
      "Premium templates",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    description: "For large scale operations",
    features: [
      "Unlimited subscribers",
      "Unlimited emails",
      "Custom templates",
      "24/7 phone support",
      "Advanced automation",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Choose the right plan for you
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Start for free, upgrade as you grow. All plans come with a 14-day
            free trial.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 md:max-w-none md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col p-8 ${plan.popular ? "border-primary" : ""}`}
            >
              <h3 className="text-xl font-semibold leading-7">{plan.name}</h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <Button
                className="mt-6"
                variant={plan.popular ? "default" : "outline"}
              >
                Get started
              </Button>
              <ul className="mt-8 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
