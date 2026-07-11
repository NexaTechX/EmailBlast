const brands = [
  { name: "Notion", mark: "N" },
  { name: "Stripe", mark: "S" },
  { name: "Vercel", mark: "▲" },
  { name: "Linear", mark: "L" },
  { name: "Figma", mark: "F" },
  { name: "Shopify", mark: "◈" },
  { name: "Airbnb", mark: "A" },
  { name: "Spotify", mark: "♪" },
  { name: "Slack", mark: "#" },
  { name: "Dropbox", mark: "D" },
  { name: "Intercom", mark: "I" },
  { name: "HubSpot", mark: "H" },
];

function BrandRow({ reverse = false }: { reverse?: boolean }) {
  const list = [...brands, ...brands];
  return (
    <div
      className={`flex w-max items-center gap-10 pr-10 ${
        reverse ? "animate-marquee-slow [animation-direction:reverse]" : "animate-marquee"
      }`}
      aria-hidden={reverse}
    >
      {list.map((brand, i) => (
        <div
          key={`${brand.name}-${i}`}
          className="group flex shrink-0 items-center gap-3 opacity-55 transition-opacity duration-300 hover:opacity-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-sm font-semibold text-foreground/80 shadow-sm">
            {brand.mark}
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground/70 sm:text-xl">
            {brand.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TrustedBy() {
  return (
    <section className="border-y bg-muted/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center lg:gap-12 lg:px-8 lg:py-14">
        {/* Side label */}
        <div className="shrink-0 lg:w-44">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Trusted & used by
          </p>
          <p className="mt-2 text-sm font-medium leading-snug text-foreground/80">
            Teams at companies building the modern web
          </p>
        </div>

        {/* Side-scrolling brand names */}
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-muted/20 to-transparent sm:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-muted/20 to-transparent sm:w-16" />
          <div className="space-y-5">
            <BrandRow />
            <BrandRow reverse />
          </div>
        </div>
      </div>
    </section>
  );
}
