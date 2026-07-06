const stats = [
  { value: "Free", label: "During beta" },
  { value: "Resend", label: "Deliverability partner" },
  { value: "Open + click", label: "Tracking built in" },
  { value: "CAN-SPAM", label: "Compliance helpers" },
];

export function SocialProof() {
  return (
    <section id="customers" className="border-b">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Free beta
        </p>
        <h2 className="mx-auto mt-4 max-w-xl text-2xl font-semibold tracking-tight">
          EmailBlast is in early access. We&apos;re building in public with real
          users — no fake logos, no inflated metrics.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Join the beta, send campaigns to your own list, and help us shape what
          ships next.
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y border-x lg:grid-cols-4 lg:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-10">
            <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
