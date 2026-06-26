import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { CTASection } from "@/components/landing/cta-section";
import { useAuth } from "@/lib/auth";

const stats = [
  { value: "2024", label: "Founded" },
  { value: "10M+", label: "Emails / month" },
  { value: "12k", label: "Teams" },
  { value: "40+", label: "Countries" },
];

const values = [
  {
    n: "01",
    title: "Craft over clutter",
    body: "We sweat the details most tools ignore — typography, spacing, deliverability. The boring parts done right are a feature.",
  },
  {
    n: "02",
    title: "Deliverability first",
    body: "An email that doesn't reach the inbox is worthless. We treat reputation and authentication as core product, not an add-on.",
  },
  {
    n: "03",
    title: "Built in the open",
    body: "We ship fast, listen closely, and tell you what changed. Our roadmap is shaped by the teams who use EmailBlast every day.",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const start = () => navigate(user ? "/app" : "/auth");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-16">
        {/* Heading */}
        <section className="border-b">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              About
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
              The email platform we always wanted to use.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              EmailBlast started with a simple frustration: every email tool felt
              either too basic or too bloated, and none of them respected the
              craft of a good campaign. So we built one that does.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b">
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

        {/* Values */}
        <section className="border-b">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="border-b py-16">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                What we believe
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
                Principles we won't compromise on.
              </h2>
            </div>
          </div>
          <div className="mx-auto grid max-w-7xl grid-cols-1 border-x md:grid-cols-3">
            {values.map((v, i) => (
              <div
                key={v.n}
                className={`p-8 sm:p-10 ${
                  i < values.length - 1 ? "border-b md:border-b-0 md:border-r" : ""
                }`}
              >
                <span className="font-mono text-5xl font-semibold tabular-nums text-foreground/15">
                  {v.n}
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="border-b">
          <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8 lg:py-28">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Our story
            </p>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-foreground/90">
              <p>
                We're a small team of marketers and engineers who spent years
                fighting our own tools. Reports in one app, design in another,
                deliverability a black box, and copywriting that always landed on
                someone's already-full plate.
              </p>
              <p>
                EmailBlast brings it into one place — an{" "}
                <span className="text-emerald-600">AI copywriter</span>, a real
                visual builder, live analytics, and deliverability handled for
                you. The goal is simple: make sending great email feel effortless,
                so your team can focus on the message, not the machinery.
              </p>
            </div>
          </div>
        </section>

        <CTASection onGetStarted={start} />
      </main>
      <SiteFooter />
    </div>
  );
}
