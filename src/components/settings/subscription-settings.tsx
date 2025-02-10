import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Crown, Check } from "lucide-react";
import { createCheckoutSession } from "@/lib/creem";

const plans = [
  {
    name: "Free",
    price: "$0",
    priceId: "price_free",
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
    priceId: "price_pro",
    features: [
      "Up to 5,000 subscribers",
      "20,000 emails per month",
      "Premium templates",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
  },
  {
    name: "Enterprise",
    price: "$99",
    priceId: "price_enterprise",
    features: [
      "Unlimited subscribers",
      "Unlimited emails",
      "Custom templates",
      "24/7 phone support",
      "Advanced automation",
      "Dedicated account manager",
    ],
  },
];

export function SubscriptionSettings() {
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planName: string) => {
    setLoading(true);
    try {
      const plan = plans.find((p) => p.name === planName);
      if (!plan) throw new Error("Invalid plan");

      await createCheckoutSession({
        priceId: plan.priceId,
        successUrl: `${window.location.origin}/app/settings/subscription?success=true`,
        cancelUrl: `${window.location.origin}/app/settings/subscription?canceled=true`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upgrade plan",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Subscription</h2>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <span className="font-semibold">Current Plan: {currentPlan}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="p-6">
            <div className="flex flex-col h-full">
              <div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
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
                variant={plan.name === currentPlan ? "outline" : "default"}
                disabled={plan.name === currentPlan || loading}
                onClick={() => handleUpgrade(plan.name)}
              >
                {plan.name === currentPlan
                  ? "Current Plan"
                  : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
