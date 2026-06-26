export function Testimonials() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="border-x">
          <div className="border-b px-8 py-6 sm:px-12">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              03 — Customers
            </p>
          </div>

          <figure className="px-8 py-16 sm:px-12 sm:py-24">
            <blockquote className="max-w-4xl text-2xl font-medium leading-[1.35] tracking-tight sm:text-[2rem] sm:leading-[1.3]">
              “We replaced three tools with EmailBlast and{" "}
              <span className="text-emerald-600">doubled our open rates</span> in
              a single quarter. It's the first email platform that feels built by
              people who actually send email.”
            </blockquote>

            <figcaption className="mt-10 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                SC
              </div>
              <div className="text-sm">
                <p className="font-semibold">Sarah Chen</p>
                <p className="font-mono text-muted-foreground">
                  Head of Growth, Lumen
                </p>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
