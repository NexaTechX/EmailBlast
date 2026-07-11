import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Send,
  Users,
  BarChart3,
  Radar,
  Settings,
  LogOut,
  Menu,
  X,
  FlaskConical,
  Workflow,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Campaigns", href: "/app/campaigns", icon: Send },
  { name: "Subscribers", href: "/app/subscribers", icon: Users },
  { name: "Automations", href: "/app/automations", icon: Workflow },
  { name: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { name: "A/B Testing", href: "/app/ab-testing", icon: FlaskConical },
  { name: "Lead finder (beta)", href: "/app/lead-finder", icon: Radar },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
        <span className="text-sm font-bold">E</span>
      </div>
      <span className="text-[15px] font-semibold tracking-tight">EmailBlast</span>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (href: string) =>
    href === "/app"
      ? location.pathname === "/app"
      : location.pathname.startsWith(href);

  const email = (user as any)?.email as string | undefined;
  const initial = (email?.[0] || "U").toUpperCase();

  const isEditorRoute =
    location.pathname === "/app/campaigns/new" ||
    /^\/app\/campaigns\/[^/]+$/.test(location.pathname);

  return (
    <div
      className={cn(
        "flex bg-background",
        isEditorRoute ? "h-dvh max-h-dvh overflow-hidden" : "min-h-screen",
      )}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col border-r">
          <div className="flex h-16 items-center justify-between px-5">
            <Wordmark />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-t px-3 py-4">
            <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Workspace
            </p>
            <nav className="space-y-0.5">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className="h-[18px] w-[18px] shrink-0"
                      strokeWidth={active ? 2 : 1.75}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Account */}
          <div className="mt-auto border-t p-3">
            <div className="flex items-center gap-3 rounded-md px-2 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {email || "Your account"}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Free beta
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-start gap-2 text-muted-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col lg:ml-64",
          isEditorRoute && "h-dvh max-h-dvh overflow-hidden",
        )}
      >
        <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b bg-background/80 px-4 backdrop-blur-xl lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Wordmark />
        </div>

        <main
          className={cn(
            "min-h-0 flex-1",
            isEditorRoute && "flex flex-col overflow-hidden",
          )}
        >
          {isEditorRoute ? (
            children
          ) : (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
