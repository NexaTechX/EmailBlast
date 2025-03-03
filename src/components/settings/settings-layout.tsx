import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { User, CreditCard, Settings, Shield, Users } from "lucide-react";

const settingsNav = [
  {
    title: "Profile",
    href: "/app/settings",
    icon: User,
  },
  {
    title: "Subscription",
    href: "/app/settings/subscription",
    icon: CreditCard,
  },
  {
    title: "Preferences",
    href: "/app/settings/preferences",
    icon: Settings,
  },
  {
    title: "Security",
    href: "/app/settings/security",
    icon: Shield,
  },
  {
    title: "Team",
    href: "/app/settings/team",
    icon: Users,
  },
];

export function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {settingsNav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  location.pathname === item.href
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline",
                  "justify-start",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
