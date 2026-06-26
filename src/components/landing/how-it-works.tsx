const steps = [
  {
    n: "01",
    title: "Import & segment",
    body: "Bring contacts in from a CSV or sync. We clean, dedupe, and organize into smart segments automatically.",
  },
  {
    n: "02",
    title: "Draft & design",
    body: "Generate copy with AI, then shape it in the visual builder. Your brand styles applied everywhere.",
  },
  {
    n: "03",
    title: "Send & measure",
    body: "Ship now or schedule per segment, then watch opens, clicks, and revenue update in real time.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="border-b py-16">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            02 — Workflow
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
            From idea to inbox in three steps.
          </h2>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 border-x md:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={`p-8 sm:p-10 ${i < steps.length - 1 ? "border-b md:border-b-0 md:border-r" : ""}`}
          >
            <span className="font-mono text-5xl font-semibold tabular-nums text-foreground/15">
              {s.n}
            </span>
            <h3 className="mt-6 text-lg font-semibold tracking-tight">
              {s.title}
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
