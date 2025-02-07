import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Users, BarChart, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            About Us
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Empowering businesses through effective email marketing
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            EmailBlast was founded with a simple mission: to make email
            marketing accessible, effective, and enjoyable for businesses of all
            sizes.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Card className="p-8">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Our Mission</h3>
              </div>
              <p className="mt-4 text-muted-foreground">
                We believe that every business deserves access to powerful email
                marketing tools. Our platform is built to help you grow your
                audience and engage with your customers effectively.
              </p>
            </Card>

            <Card className="p-8">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Our Values</h3>
              </div>
              <p className="mt-4 text-muted-foreground">
                Security, reliability, and user experience are at the core of
                everything we do. We're committed to providing a platform you
                can trust with your business.
              </p>
            </Card>
          </div>

          <Card className="mt-8 p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold">Ready to get started?</h3>
              <p className="mt-4 text-muted-foreground">
                Join thousands of businesses already using EmailBlast to grow
                their audience.
              </p>
              <Button size="lg" className="mt-6">
                Start Free Trial
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
