import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DemoModal } from "@/components/demo-modal";
import { easeOut, useMotionSafe } from "./motion";

interface HeroProps {
  onGetStarted: () => void;
}

const SUBJECTS = [
  "Your spring access is live — claim it",
  "3 ways teams cut send time in half",
  "Open rates up. Busywork down.",
];

const ACTIVITY = [
  { t: "Opened", who: "maya@north.co", meta: "2s ago" },
  { t: "Clicked", who: "jon@lumen.io", meta: "9s ago" },
  { t: "Converted", who: "aria@stack.dev", meta: "18s ago" },
];

export function Hero({ onGetStarted }: HeroProps) {
  const [showDemo, setShowDemo] = useState(false);
  const animate = useMotionSafe();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.35] [mask-image:linear-gradient(to_bottom,black_15%,transparent_80%)]" />

      <div className="mx-auto max-w-7xl px-6 pt-24 lg:px-8 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={animate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card/90 py-1 pl-1.5 pr-3 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="pulse-dot absolute inline-flex h-2 w-2 rounded-full bg-signal" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            Free beta · AI campaigns shipping now
          </motion.div>

          <motion.p
            initial={animate ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: easeOut }}
            className="mt-8 text-[13px] font-semibold tracking-[0.22em] text-foreground/45 uppercase"
          >
            EmailBlast
          </motion.p>

          <motion.h1
            initial={animate ? { opacity: 0, y: 18 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: easeOut }}
            className="mt-4 text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-[4.15rem]"
          >
            Email infrastructure
            <br className="hidden sm:block" />
            <span className="text-signal"> with an AI editor.</span>
          </motion.h1>

          <motion.p
            initial={animate ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.14, ease: easeOut }}
            className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
          >
            Draft, segment, deliver, and measure in one workspace — built for
            operators who care about inbox placement and craft.
          </motion.p>

          <motion.div
            initial={animate ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: easeOut }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="group h-12 px-6 text-[0.95rem] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start for free
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
            <button
              onClick={() => setShowDemo(true)}
              className="group inline-flex h-12 items-center gap-1.5 rounded-md border border-border/80 bg-card/60 px-4 text-[0.95rem] font-medium text-foreground/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-foreground/20 hover:text-foreground"
            >
              Book a demo
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            <DemoModal open={showDemo} onOpenChange={setShowDemo} />
          </motion.div>
        </div>

        <motion.div
          initial={animate ? { opacity: 0, y: 36 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.24, ease: easeOut }}
          className="relative mt-14 lg:mt-20"
        >
          <div className="absolute -inset-x-4 -bottom-6 top-1/4 -z-10 bg-gradient-to-b from-transparent via-muted/50 to-background sm:-inset-x-10 lg:-inset-x-20" />
          <ProductCanvas />
        </motion.div>
      </div>
    </section>
  );
}

function ActivityFeed() {
  const [i, setI] = useState(0);
  const animate = useMotionSafe();

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setI((v) => (v + 1) % ACTIVITY.length), 2200);
    return () => clearInterval(id);
  }, [animate]);

  const item = ACTIVITY[i];

  return (
    <div className="mt-2 min-h-[2.75rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.who}
          initial={animate ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={animate ? { opacity: 0, y: -6 } : undefined}
          transition={{ duration: 0.28 }}
        >
          <p className="text-xs font-medium">
            <span className="text-signal">{item.t}</span>
            <span className="text-muted-foreground"> · {item.who}</span>
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            {item.meta}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProductCanvas() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-[0_40px_90px_-48px_rgba(15,23,42,0.5)] ring-1 ring-black/[0.04] dark:shadow-[0_40px_90px_-48px_rgba(0,0,0,0.75)] dark:ring-white/[0.06]">
      <div className="flex items-center gap-2 border-b bg-muted/25 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/12" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/12" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/12" />
        </div>
        <div className="mx-auto flex min-w-0 items-center gap-2 rounded-md border bg-background/80 px-3 py-1 font-mono text-[11px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="pulse-dot absolute inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
          </span>
          <span className="truncate">app.emailblast.io / campaigns / spring-launch</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[188px_1fr_220px]">
        <aside className="hidden border-r bg-muted/15 p-3.5 lg:block">
          <div className="mb-5 flex items-center gap-2 px-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
              <span className="text-[10px] font-bold">E</span>
            </div>
            <span className="text-[13px] font-semibold tracking-tight">EmailBlast</span>
          </div>
          <nav className="space-y-0.5">
            {[
              { label: "Overview", active: false },
              { label: "Campaigns", active: true },
              { label: "Subscribers", active: false },
              { label: "Automations", active: false },
              { label: "Analytics", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                  item.active
                    ? "bg-foreground font-medium text-background"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </div>
            ))}
          </nav>
          <div className="mt-6 rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                AI score
              </p>
              <span className="font-mono text-[10px] text-signal">A+</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight">
              92
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="metric-bar h-full rounded-full bg-signal"
                style={{ width: "92%", animationDelay: "0.35s" }}
              />
            </div>
          </div>
        </aside>

        <div className="min-w-0 border-r-0 lg:border-r">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <h3 className="truncate text-sm font-semibold tracking-tight">
                Spring Launch Sequence
              </h3>
              <span className="shrink-0 rounded-md bg-signal-soft px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-signal">
                Live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-md border px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                A/B · 2 variants
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                18,402
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x border-b sm:grid-cols-4">
            {[
              { k: "Open rate", v: "42.8%", d: "+6.4" },
              { k: "Click rate", v: "12.3%", d: "+2.1" },
              { k: "Conversions", v: "846", d: "+12%" },
              { k: "Inbox", v: "99.6%", d: "stable" },
            ].map((m, idx) => (
              <motion.div
                key={m.k}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + idx * 0.07, duration: 0.4, ease: easeOut }}
                className="px-3.5 py-3.5 sm:px-4"
              >
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  {m.k}
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <p className="font-mono text-lg font-semibold tabular-nums tracking-tight sm:text-xl">
                    {m.v}
                  </p>
                  <span className="font-mono text-[10px] text-signal">{m.d}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden border-b p-4 sm:p-5 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px scan-line bg-gradient-to-r from-transparent via-signal/40 to-transparent opacity-0" />
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  Opens · 14 days
                </p>
                <p className="font-mono text-[10px] text-signal">▲ 18.2%</p>
              </div>
              <AreaChart />
            </div>

            <div className="p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  AI draft
                </p>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-signal" />
                  Generating
                </span>
              </div>
              <AiDraftPanel />
            </div>
          </div>
        </div>

        <aside className="hidden border-l-0 bg-muted/10 p-4 lg:block">
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Live activity
          </p>
          <div className="mt-2">
            <ActivityFeed />
          </div>
          <div className="mt-5 border-t pt-4">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Segment
            </p>
            <p className="mt-1.5 text-sm font-semibold tracking-tight">
              Engaged · 30d
            </p>
            <div className="mt-4 space-y-2.5">
              {[
                { label: "Opened ≥1", pct: 78 },
                { label: "Clicked", pct: 34 },
                { label: "Converted", pct: 11 },
              ].map((row, i) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between font-mono text-[10px] text-muted-foreground">
                    <span>{row.label}</span>
                    <span>{row.pct}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="metric-bar h-full rounded-full bg-foreground/70"
                      style={{
                        width: `${row.pct}%`,
                        animationDelay: `${0.7 + i * 0.12}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-dashed bg-card/60 p-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Next send window{" "}
              <span className="font-medium text-foreground">Tue 10:14</span>{" "}
              local time
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AiDraftPanel() {
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const animate = useMotionSafe();
  const full = SUBJECTS[idx];

  useEffect(() => {
    if (!animate) {
      setChars(full.length);
      return;
    }
    setChars(0);
    let n = 0;
    const type = setInterval(() => {
      n += 1;
      setChars(n);
      if (n >= full.length) clearInterval(type);
    }, 28);
    const next = setTimeout(() => {
      setIdx((v) => (v + 1) % SUBJECTS.length);
    }, full.length * 28 + 1800);
    return () => {
      clearInterval(type);
      clearTimeout(next);
    };
  }, [idx, full, animate]);

  return (
    <div className="rounded-lg border bg-muted/25 p-3.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Subject
      </p>
      <p className="mt-1.5 min-h-[2.5rem] text-[13px] font-medium leading-snug text-foreground/90">
        {full.slice(0, chars)}
        <span className="caret-blink ml-px inline-block h-3.5 w-[2px] translate-y-[2px] bg-signal align-middle" />
      </p>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Urgency + benefit framed for engaged segment. Score{" "}
        <span className="font-mono font-medium text-signal">92</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Variant A · 92", "B · 87", "C · 81"].map((v, i) => (
          <span
            key={v}
            className={`rounded border px-1.5 py-0.5 font-mono text-[9px] ${
              i === 0
                ? "border-signal/30 bg-signal-soft text-signal"
                : "bg-card text-muted-foreground"
            }`}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function AreaChart() {
  const line =
    "M0,78 C30,72 48,40 78,44 C108,48 120,20 150,30 C180,40 196,14 226,20 C256,26 276,8 320,12";
  const area = `${line} L320,110 L0,110 Z`;
  return (
    <svg viewBox="0 0 320 110" className="h-28 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(160 72% 36%)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="hsl(160 72% 36%)" stopOpacity="0" />
        </linearGradient>
      </defs>
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
      <path d={area} fill="url(#heroFade)" className="draw-area" />
      <path
        d={line}
        fill="none"
        stroke="hsl(160 72% 36%)"
        strokeWidth="2"
        strokeLinecap="round"
        className="draw-line"
      />
      <circle cx="320" cy="12" r="3.5" fill="hsl(160 72% 36%)" className="draw-area" />
    </svg>
  );
}
