import { Reveal, Stagger, StaggerItem } from "./motion";

const steps = [
  {
    n: "01",
    title: "Import & segment",
    body: "Bring contacts from CSV. We clean, dedupe, and organize into lists ready for targeting.",
    gui: (
      <div className="mt-6 rounded-lg border bg-card p-3 shadow-sm">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-medium">contacts.csv</span>
          <span className="font-mono text-signal">2,418 rows</span>
        </div>
        <div className="mt-2.5 space-y-1.5">
          {["Deduped", "Tagged", "List: Launch"].map((s, i) => (
            <div
              key={s}
              className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 font-mono text-[10px] text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              {s}
              <span className="ml-auto tabular-nums text-foreground/50">
                {i === 0 ? "−37" : i === 1 ? "+4 tags" : "ready"}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    n: "02",
    title: "Draft with AI",
    body: "Generate copy and variants, then refine in the editor. Brand-safe, human-approved.",
    gui: (
      <div className="mt-6 rounded-lg border bg-card p-3 shadow-sm">
        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          Subject variants
        </p>
        <div className="mt-2 space-y-1.5">
          {[
            { t: "Your access is live", sc: "92" },
            { t: "Claim before Friday", sc: "87" },
          ].map((r, i) => (
            <div
              key={r.t}
              className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-[11px] ${
                i === 0 ? "border-signal/25 bg-signal-soft/40" : "bg-muted/30"
              }`}
            >
              <span className="font-medium">{r.t}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {r.sc}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    n: "03",
    title: "Send & learn",
    body: "Ship now or schedule. Watch opens, clicks, and conversions update as they happen.",
    gui: (
      <div className="mt-6 rounded-lg border bg-card p-3 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Live opens
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tabular-nums">
              42.8%
            </p>
          </div>
          <span className="font-mono text-[10px] text-signal">▲ 18%</span>
        </div>
        <div className="mt-3 flex h-10 items-end gap-1">
          {[40, 55, 48, 62, 70, 66, 82].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-foreground/15"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="border-y bg-muted/20 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Workflow
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl sm:leading-[1.1]">
            From idea to inbox in three steps.
          </h2>
        </Reveal>

        <Stagger className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((s, i) => (
            <StaggerItem key={s.n}>
              <div className="relative h-full rounded-2xl border bg-background/80 p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                {i < steps.length - 1 && (
                  <div className="pointer-events-none absolute -right-3 top-10 z-10 hidden h-px w-6 bg-border md:block" />
                )}
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border bg-card font-mono text-[11px] font-semibold shadow-sm">
                    {s.n}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {s.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
                {s.gui}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
