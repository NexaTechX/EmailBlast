import {
  PenLine,
  LayoutTemplate,
  BarChart3,
  Filter,
  Workflow,
  ShieldCheck,
  Radar,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: PenLine,
    name: "AI copywriter",
    description:
      "Describe the goal; get subject lines and full campaigns drafted in your voice. Edit anything.",
  },
  {
    icon: LayoutTemplate,
    name: "No-code builder",
    description:
      "Compose with brand blocks and live preview. Pixel-perfect on every client, every device.",
  },
  {
    icon: BarChart3,
    name: "Live analytics",
    description:
      "Opens, clicks, conversions and revenue — streamed in real time, segment by segment.",
  },
  {
    icon: Filter,
    name: "Segmentation",
    description:
      "Dynamic lists from tags, events, and behavior. Send the right message to the right people.",
  },
  {
    icon: Workflow,
    name: "Automations",
    description:
      "Welcome series, drips, and win-backs that run on autopilot from a single canvas.",
  },
  {
    icon: ShieldCheck,
    name: "Deliverability",
    description:
      "Authentication, warm-up, and reputation monitoring keep you out of spam — for good.",
  },
];

export function Features() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* section header */}
        <div className="flex flex-col gap-6 border-b py-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              01 — Capabilities
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
              Everything you need to ship
              <br className="hidden sm:block" /> campaigns that perform.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            One workspace, from the first draft to the final report. No glue code,
            no spreadsheets, no tab-juggling.
          </p>
        </div>
      </div>

      {/* ruled feature grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 border-x sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={f.name}
            className="group border-b border-r p-8 transition-colors hover:bg-muted/40 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-card">
                <f.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
              <span className="font-mono text-xs text-muted-foreground/60">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-6 text-base font-semibold tracking-tight">
              {f.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.description}
            </p>
          </div>
        ))}
      </div>

      {/* Capstone — Lead finder / scraping */}
      <div className="group mx-auto max-w-7xl border-x border-b">
        <div className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:items-center sm:gap-12">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-card">
                <Radar className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
              <span className="font-mono text-xs text-muted-foreground/60">07</span>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">
                Lead finder
              </h3>
              <span className="rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-600">
                New
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Find new customers without leaving the app.
            </p>
          </div>

          <div className="sm:border-l sm:pl-12">
            <p className="text-[0.95rem] leading-relaxed text-foreground/90">
              Scrape verified business leads from any website, domain, or search
              query — names, roles, and emails — enriched and deduped, then pushed
              straight into a segment that&apos;s ready to send.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-500" /> By domain
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-500" /> By URL
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-500" /> AI-enriched
              </span>
              <span className="ml-auto inline-flex items-center gap-1 text-foreground/70 transition-colors group-hover:text-foreground">
                Explore <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
