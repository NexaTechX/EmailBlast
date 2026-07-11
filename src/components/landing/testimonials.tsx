import { Reveal, Stagger, StaggerItem } from "./motion";

const outcomes = [
  {
    metric: "Faster drafts",
    detail: "AI subject + body variants so campaigns leave the editor sooner.",
  },
  {
    metric: "Clearer signal",
    detail: "Opens, clicks, and conversions in one view — no spreadsheet stitching.",
  },
  {
    metric: "Safer sends",
    detail: "Unsubscribe links, mailing address, and CAN-SPAM checks by default.",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-end lg:gap-20">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Why teams switch
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl sm:leading-[1.1]">
              Less tooling. More campaigns that actually ship.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              EmailBlast replaces the patchwork of docs, AI tabs, and ESP
              dashboards with one focused workflow.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <blockquote className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm sm:p-10">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-signal/10 blur-2xl" />
              <p className="relative text-xl font-medium leading-snug tracking-tight sm:text-2xl sm:leading-[1.35]">
                “We stopped juggling three tools just to send a weekly campaign.
                Draft, list, send, measure —{" "}
                <span className="text-signal">
                  it finally feels like one product.
                </span>
                ”
              </p>
              <footer className="relative mt-8 flex items-center gap-3 border-t pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-soft font-mono text-xs font-semibold text-signal">
                  β
                </div>
                <div className="text-sm">
                  <p className="font-semibold">Early beta team</p>
                  <p className="text-muted-foreground">Building with us in public</p>
                </div>
              </footer>
            </blockquote>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid gap-4 sm:grid-cols-3">
          {outcomes.map((o) => (
            <StaggerItem key={o.metric}>
              <div className="h-full rounded-xl border bg-muted/20 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-card hover:shadow-sm">
                <p className="text-sm font-semibold tracking-tight">{o.metric}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {o.detail}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
