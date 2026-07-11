import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PenLine,
  LayoutTemplate,
  BarChart3,
  Filter,
  Workflow,
  ShieldCheck,
  Radar,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem, easeOut, useMotionSafe } from "./motion";

const features = [
  {
    icon: PenLine,
    name: "AI copywriter",
    description:
      "Describe the goal; get subject lines and body copy drafted fast. Edit everything before you send.",
  },
  {
    icon: LayoutTemplate,
    name: "Campaign editor",
    description:
      "Write with formatting, templates, and live preview — then send through Resend.",
  },
  {
    icon: BarChart3,
    name: "Performance analytics",
    description:
      "Track sends, unique opens, clicks, conversions, bounces, and unsubscribes per campaign.",
  },
  {
    icon: Filter,
    name: "Lists & tags",
    description:
      "Organize subscribers into lists, filter by tags, and import from CSV in minutes.",
  },
  {
    icon: Workflow,
    name: "Welcome automations",
    description:
      "Drip delayed emails when someone joins a list. Activate, pause, or edit anytime.",
  },
  {
    icon: ShieldCheck,
    name: "Compliance built in",
    description:
      "CAN-SPAM checks plus automatic unsubscribe links and mailing address footers.",
  },
];

const demos = [
  {
    id: "write",
    label: "Write",
    title: "AI that drafts, you decide",
    body: "Brief the model once. Get scored subject lines and body variants — nothing sends without you.",
  },
  {
    id: "segment",
    label: "Segment",
    title: "Lists that stay clean",
    body: "Import, dedupe, tag, and target. Segments update as engagement changes.",
  },
  {
    id: "measure",
    label: "Measure",
    title: "Signal without the spreadsheet",
    body: "Opens, clicks, and conversions land in one campaign view as events arrive.",
  },
] as const;

export function Features() {
  const [active, setActive] = useState<(typeof demos)[number]["id"]>("write");
  const demo = demos.find((d) => d.id === active)!;

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Platform
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl sm:leading-[1.1]">
            A workspace that feels like the product you already imagined.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Not another tab farm. One surface from brief to inbox report.
          </p>
        </Reveal>

        {/* Interactive product demo */}
        <Reveal delay={0.08} className="mt-12">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/20 p-2">
              {demos.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActive(d.id)}
                  className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    active === d.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active === d.id && (
                    <motion.span
                      layoutId="feature-tab"
                      className="absolute inset-0 rounded-lg border bg-background shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{d.label}</span>
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-[0.95fr_1.15fr]">
              <div className="border-b p-7 sm:p-8 lg:border-b-0 lg:border-r">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={demo.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: easeOut }}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-signal">
                      {demo.label}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                      {demo.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                      {demo.body}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="relative min-h-[260px] bg-muted/15 p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={demo.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                    className="h-full"
                  >
                    {demo.id === "write" && <WriteGui />}
                    {demo.id === "segment" && <SegmentGui />}
                    {demo.id === "measure" && <MeasureGui />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>

        <Stagger className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <StaggerItem key={f.name}>
              <div className="group h-full rounded-xl border border-transparent p-1 transition-colors duration-300 hover:border-border hover:bg-muted/30">
                <div className="p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card shadow-sm transition-all duration-300 group-hover:border-signal/25 group-hover:bg-signal-soft group-hover:shadow-md">
                    <f.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-5 text-[15px] font-semibold tracking-tight">
                    {f.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-16">
          <LeadFinderBanner />
        </Reveal>
      </div>
    </section>
  );
}

function WriteGui() {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Campaign brief</span>
        <span className="rounded bg-signal-soft px-1.5 py-0.5 font-mono text-[9px] text-signal">
          Ready
        </span>
      </div>
      <div className="mt-3 rounded-lg border bg-muted/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
        Announce spring access to engaged users. Tone: confident, short. CTA:
        claim access.
      </div>
      <div className="mt-4 space-y-2">
        {[
          { s: "Your spring access is live", score: 92 },
          { s: "Claim your seat before Friday", score: 87 },
          { s: "Something new for your list", score: 71 },
        ].map((row, i) => (
          <div
            key={row.s}
            className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-xs ${
              i === 0 ? "border-signal/30 bg-signal-soft/50" : "bg-background"
            }`}
          >
            <span className="font-medium text-foreground/90">{row.s}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {row.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SegmentGui() {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium">Engaged · 30 days</p>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        4,812 contacts · auto-refresh
      </p>
      <div className="mt-4 space-y-3">
        {[
          { name: "Opened in 30d", count: "3,740" },
          { name: "Clicked once+", count: "1,208" },
          { name: "Exclude bounced", count: "−64" },
        ].map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between border-b border-dashed pb-2.5 text-xs last:border-0"
          >
            <span className="text-muted-foreground">{row.name}</span>
            <span className="font-mono font-medium tabular-nums">{row.count}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-4">
        <div className="rounded-lg border border-dashed px-3 py-2.5 text-[11px] text-muted-foreground">
          Rule: <span className="text-foreground">opened ≥ 1</span> AND{" "}
          <span className="text-foreground">status = active</span>
        </div>
      </div>
    </div>
  );
}

function MeasureGui() {
  const bars = [42, 58, 51, 70, 64, 78, 88];
  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium">Campaign performance</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight">
            42.8%
          </p>
        </div>
        <span className="font-mono text-[10px] text-signal">opens · 7d</span>
      </div>
      <div className="mt-5 flex h-24 items-end gap-1.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-signal/80"
            style={{
              height: `${h}%`,
              animation: `grow-y 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${0.05 * i}s both`,
              transformOrigin: "bottom",
            }}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["12.3%", "CTR"],
          ["846", "Conv."],
          ["0.4%", "Bounce"],
        ].map(([v, k]) => (
          <div key={k} className="rounded-md border bg-muted/30 py-2">
            <p className="font-mono text-xs font-semibold tabular-nums">{v}</p>
            <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">{k}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadFinderBanner() {
  const animate = useMotionSafe();
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-foreground text-background">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-signal/20 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
      </div>
      <div className="relative grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-background/70">
            <Radar className="h-3 w-3" />
            New · Lead finder
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Find customers without leaving the app.
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-background/60">
            Pull verified business leads from a domain or URL — names, roles,
            emails — enriched and ready to segment.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "By domain", sample: "acme.com → 128 leads" },
            { label: "By URL", sample: "Page scrape · roles" },
            { label: "AI-enriched", sample: "Title · company · email" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={animate ? { opacity: 0, y: 10 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: easeOut }}
              className="rounded-xl border border-background/10 bg-background/[0.06] px-4 py-5 backdrop-blur-sm transition-colors duration-300 hover:bg-background/[0.1]"
            >
              <p className="text-sm font-medium text-background/95">{item.label}</p>
              <p className="mt-2 font-mono text-[10px] text-background/45">
                {item.sample}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
