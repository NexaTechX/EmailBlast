import { Reveal, Stagger, StaggerItem } from "./motion";

const pillars = [
  {
    title: "AI that writes like your brand",
    body: "Subject lines, body copy, and variants in seconds — you keep editorial control.",
  },
  {
    title: "Delivery you can trust",
    body: "Resend-powered sends with open, click, and bounce tracking built in.",
  },
  {
    title: "Ship without the stack",
    body: "Lists, automations, analytics, and compliance in one workspace — free during beta.",
  },
];

export function SocialProof() {
  return (
    <section className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
        <Reveal className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Early access
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Built in public with real teams — not inflated vanity metrics.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Join the beta, send to your own list, and help shape what ships next.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-8 sm:grid-cols-3">
          {pillars.map((p) => (
            <StaggerItem key={p.title}>
              <div className="relative pl-4 before:absolute before:left-0 before:top-1 before:h-8 before:w-0.5 before:rounded-full before:bg-signal">
                <h3 className="text-sm font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
