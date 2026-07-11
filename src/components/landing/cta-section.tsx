import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./motion";

interface CTAProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTAProps) {
  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_0%,hsl(160_50%_40%/0.2),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.07] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-10 py-20 lg:flex-row lg:items-center lg:py-28">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-background/45">
              Get started
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.75rem] sm:leading-[1.05]">
              Send your first AI-assisted campaign today.
            </h2>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-background/55">
              Free during beta. No credit card. Set up in minutes and reach the
              inbox from your first send.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="group h-12 bg-background px-6 text-[0.95rem] text-foreground transition-transform duration-200 hover:scale-[1.02] hover:bg-background/90 active:scale-[0.98]"
            >
              Start for free
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
            <p className="font-mono text-xs text-background/45">
              No card · Cancel anytime
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
