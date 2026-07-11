import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Crown, Check, Clock } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    features: [
      "Up to 200 subscribers",
      "100 emails per month",
      "Basic templates",
      "Email support",
    ],
    current: true,
  },
  {
    name: "Pro",
    price: "$29",
    features: [
      "Up to 5,000 subscribers",
      "20,000 emails per month",
      "Premium templates",
      "Priority support",
      "Advanced analytics",
    ],
    comingSoon: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited subscribers",
      "Dedicated support",
      "Advanced automation",
      "Custom integrations",
    ],
    comingSoon: true,
  },
];

export function SubscriptionSettings() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Subscription</h2>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <span className="font-semibold">Current Plan: Free</span>
        </div>
      </div>

      <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-100">
              Paid plans coming soon
            </p>
            <p className="text-sm text-amber-800/80 dark:text-amber-200/80 mt-1">
              Billing integration is in progress. All features are currently
              available on the Free plan while we finish payment setup.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="p-6">
            <div className="flex flex-col h-full">
              <div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2">
                  {plan.price}
                  {plan.price !== "Custom" && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  )}
                </p>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6"
                variant={plan.current ? "outline" : "secondary"}
                disabled
                onClick={() =>
                  toast({
                    title: "Coming soon",
                    description: "Paid plans will be available in a future update.",
                  })
                }
              >
                {plan.current
                  ? "Current Plan"
                  : plan.comingSoon
                    ? "Coming soon"
                    : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
