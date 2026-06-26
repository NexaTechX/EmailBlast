import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CTAProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTAProps) {
  return (
    <section className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-10 py-20 lg:flex-row lg:items-center lg:justify-between lg:py-28">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-widest text-background/50">
              Get started
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.75rem] sm:leading-[1.05]">
              Send your first campaign today.
            </h2>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-background/60">
              Free to start, no credit card. Set up in minutes and reach the
              inbox from your very first send.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="h-12 bg-background px-6 text-[0.95rem] text-foreground hover:bg-background/90"
            >
              Start for free
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <p className="font-mono text-xs text-background/50">
              No card · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
