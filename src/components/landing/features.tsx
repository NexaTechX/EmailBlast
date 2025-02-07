import { Card } from "@/components/ui/card";
import { Mail, BarChart, Users, Clock } from "lucide-react";

const features = [
  {
    name: "Visual Email Builder",
    description:
      "Design beautiful emails with our drag-and-drop editor. No coding required.",
    icon: Mail,
  },
  {
    name: "Analytics Dashboard",
    description: "Track opens, clicks, and engagement with detailed analytics.",
    icon: BarChart,
  },
  {
    name: "List Management",
    description:
      "Organize and segment your subscribers for targeted campaigns.",
    icon: Users,
  },
  {
    name: "Campaign Scheduling",
    description:
      "Schedule campaigns to send at the perfect time for your audience.",
    icon: Clock,
  },
];

export function Features() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to succeed
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Powerful features to help you create and manage successful email
            campaigns
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.name} className="p-6 space-y-4">
                <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{feature.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
