import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Mail,
  Users,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Campaigns", href: "/app/campaigns", icon: Mail },
  { name: "Subscribers", href: "/app/subscribers", icon: Users },
  { name: "Analytics", href: "/app/analytics", icon: BarChart },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop, slide-in on mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col gap-y-5 border-r px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6" />
              <span className="text-xl font-bold">EmailBlast</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>

              <li className="mt-auto space-y-4">
                <div className="flex items-center gap-4 px-2">
                  <ThemeToggle />
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content - Pushed to the right on desktop */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6" />
            <span className="text-xl font-bold">EmailBlast</span>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1">
          <div className="py-8 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
