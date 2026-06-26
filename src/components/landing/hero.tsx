import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { DemoModal } from "@/components/demo-modal";

interface HeroProps {
  onGetStarted: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ onGetStarted }: HeroProps) {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section className="relative overflow-hidden border-b">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(120%_80%_at_100%_0%,black,transparent_70%)] opacity-60" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 pb-20 pt-28 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-28 lg:pt-36">
        {/* Left — editorial copy */}
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2.5 rounded-full border bg-card py-1 pl-1.5 pr-3 text-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="pulse-dot absolute inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-medium text-muted-foreground">
              v2.0 — AI campaigns now live
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
            className="mt-6 text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[4.25rem]"
          >
            Email that earns
            <br />
            attention.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease }}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground"
          >
            The email platform for teams who take their craft seriously. Write
            with AI, design without code, and reach the inbox every time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.19, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button size="lg" onClick={onGetStarted} className="h-11 px-5 text-[0.95rem]">
              Start for free
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <button
              onClick={() => setShowDemo(true)}
              className="inline-flex h-11 items-center gap-1 px-3 text-[0.95rem] font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              Book a demo
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <DemoModal open={showDemo} onOpenChange={setShowDemo} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="mt-10 flex items-center gap-5 border-t pt-6"
          >
            <div className="flex -space-x-2">
              {["A", "M", "K", "R"].map((c, i) => (
                <div
                  key={i}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground"
                >
                  {c}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">12,000+</span> teams
              send with EmailBlast
            </p>
          </motion.div>
        </div>

        {/* Right — product panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease }}
          className="relative lg:mr-[-3rem]"
        >
          {/* depth panel behind */}
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-xl border bg-card/40" />
          <CampaignPanel />
        </motion.div>
      </div>
    </section>
  );
}

function CampaignPanel() {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-[0_24px_60px_-30px_rgba(0,0,0,0.3)]">
      {/* header */}
      <div className="flex items-center justify-between border-b px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
            <span className="text-[11px] font-bold">E</span>
          </div>
          <span className="text-sm font-medium">Spring Launch</span>
          <span className="rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sent
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          18,402 recipients
        </span>
      </div>

      {/* metric row */}
      <div className="grid grid-cols-3 divide-x border-b">
        {[
          { k: "Open rate", v: "42.8", d: "+6.4", up: true },
          { k: "Click rate", v: "12.3", d: "+2.1", up: true },
          { k: "Bounced", v: "0.4", d: "-0.2", up: false },
        ].map((m) => (
          <div key={m.k} className="px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {m.k}
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-semibold tabular-nums">
                {m.v}
                <span className="text-base text-muted-foreground">%</span>
              </span>
              <span
                className={`font-mono text-[11px] ${
                  m.up ? "text-emerald-600" : "text-muted-foreground"
                }`}
              >
                {m.d}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* chart */}
      <div className="px-5 pb-5 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Opens · 14 days
          </p>
          <p className="font-mono text-[10px] text-emerald-600">▲ 18.2%</p>
        </div>
        <AreaChart />
      </div>

      {/* footer row */}
      <div className="flex items-center justify-between border-t px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono">Delivering · 99.6% inbox placement</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

function AreaChart() {
  // hand-tuned smooth path
  const line =
    "M0,78 C30,72 48,40 78,44 C108,48 120,20 150,30 C180,40 196,14 226,20 C256,26 276,8 320,12";
  const area = `${line} L320,110 L0,110 Z`;
  return (
    <svg viewBox="0 0 320 110" className="h-28 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* baseline ticks */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          x2="320"
          y1={26 + i * 26}
          y2={26 + i * 26}
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
      ))}
      <path d={area} fill="url(#fade)" />
      <path
        d={line}
        fill="none"
        stroke="hsl(160 84% 39%)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="320" cy="12" r="3" fill="hsl(160 84% 39%)" />
    </svg>
  );
}
