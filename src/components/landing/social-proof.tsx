const logos = [
  "Acme",
  "Globex",
  "Initech",
  "Umbrella",
  "Hooli",
  "Stark",
  "Soylent",
  "Vandelay",
];

const stats = [
  { value: "10M+", label: "Emails / month" },
  { value: "99.2%", label: "Deliverability" },
  { value: "2.5×", label: "Open-rate lift" },
  { value: "12k", label: "Teams onboard" },
];

export function SocialProof() {
  return (
    <section className="border-b">
      {/* logo strip */}
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
          <p className="shrink-0 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Trusted by 12,000+ teams
          </p>
          <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-14">
              {[...logos, ...logos].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="whitespace-nowrap text-lg font-semibold tracking-tight text-foreground/30"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* stat band */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y border-x lg:grid-cols-4 lg:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-10">
            <p className="font-mono text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
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
