import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, PlayCircle } from "lucide-react";
import { useState } from "react";
import { DemoModal } from "@/components/demo-modal";

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <div className="relative isolate pt-14 dark:bg-gray-900">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Email Marketing Made Simple
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Create, send, and track beautiful email campaigns that engage your
            audience and drive results. Start growing your business today with
            our powerful email marketing platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="gap-2" onClick={onGetStarted}>
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => setShowDemo(true)}
            >
              <PlayCircle className="h-4 w-4" /> Watch Demo
            </Button>
            <DemoModal open={showDemo} onOpenChange={setShowDemo} />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required · Free plan available
          </p>
        </div>
      </div>
    </div>
  );
}
