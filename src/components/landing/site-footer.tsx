import { useNavigate } from "react-router-dom";
import { Wordmark } from "./site-header";

const footerNav: Record<string, { label: string; to?: string }[]> = {
  Product: [
    { label: "Features", to: "/" },
    { label: "Pricing", to: "/pricing" },
  ],
  Company: [
    { label: "About", to: "/about" },
  ],
  Legal: [
    { label: "Privacy", to: "/legal/privacy" },
    { label: "Terms", to: "/legal/terms" },
  ],
};

export function SiteFooter() {
  const navigate = useNavigate();
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-[17rem] text-sm leading-relaxed text-muted-foreground">
              The AI email platform for teams who ship campaigns that convert.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              <span className="font-mono">All systems operational</span>
            </div>
          </div>
          {Object.entries(footerNav).map(([group, items]) => (
            <div key={group}>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {group}
              </h4>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => item.to && navigate(item.to)}
                      className="text-left text-sm text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} EmailBlast
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Free during beta
          </p>
        </div>
      </div>
    </footer>
  );
}
