import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  User,
  CreditCard,
  SlidersHorizontal,
  Shield,
  Mail,
} from "lucide-react";

const settingsNav = [
  { title: "Profile", href: "/app/settings", icon: User },
  { title: "Sending", href: "/app/settings/sending", icon: Mail },
  { title: "Subscription", href: "/app/settings/subscription", icon: CreditCard },
  { title: "Preferences", href: "/app/settings/preferences", icon: SlidersHorizontal },
  { title: "Security", href: "/app/settings/security", icon: Shield },
];

export function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Account
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Settings</h2>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
            {settingsNav.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <item.icon
                    className="h-[18px] w-[18px] shrink-0"
                    strokeWidth={active ? 2 : 1.75}
                  />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
