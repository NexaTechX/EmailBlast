import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Mail,
  Users,
  BarChart,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 flex w-64 flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r">
            <div className="flex h-16 shrink-0 items-center">
              <Mail className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">EmailBlast</span>
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
                            className={`group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${
                              isActive
                                ? "bg-gray-50 text-primary"
                                : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                            }`}
                          >
                            <item.icon className="h-6 w-6 shrink-0" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li className="mt-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <main className="pl-64 flex-1">
          <div className="py-8 px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
