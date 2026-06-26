import { useNavigate } from "react-router-dom";
import { Wordmark } from "./site-header";

const footerNav: Record<string, { label: string; to?: string }[]> = {
  Product: [
    { label: "Features", to: "/" },
    { label: "Pricing", to: "/pricing" },
    { label: "Changelog" },
    { label: "Integrations" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Blog" },
    { label: "Careers" },
    { label: "Contact" },
  ],
  Resources: [
    { label: "Docs" },
    { label: "Guides" },
    { label: "Support" },
    { label: "Status" },
  ],
  Legal: [
    { label: "Privacy", to: "/legal/privacy" },
    { label: "Terms", to: "/legal/terms" },
    { label: "Security" },
  ],
};

export function SiteFooter() {
  const navigate = useNavigate();
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
              The email platform for teams who take their craft seriously.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono">All systems operational</span>
            </div>
          </div>
          {Object.entries(footerNav).map(([group, items]) => (
            <div key={group}>
              <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
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
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} EmailBlast, Inc.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Made for marketers who move fast.
          </p>
        </div>
      </div>
    </footer>
  );
}
