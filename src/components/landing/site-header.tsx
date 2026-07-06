import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
        <span className="text-sm font-bold">E</span>
      </div>
      <span className="text-[15px] font-semibold tracking-tight">EmailBlast</span>
    </div>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleGetStarted = () => navigate(user ? "/app" : "/auth");

  const goToSection = (id: string) => {
    setMobileOpen(false);
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(
        () =>
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
        80,
      );
    }
  };

  const links = [
    { label: "Features", action: () => goToSection("features") },
    { label: "About", action: () => { setMobileOpen(false); navigate("/about"); } },
    { label: "Pricing", action: () => { setMobileOpen(false); navigate("/pricing"); } },
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6 lg:px-8">
        <button onClick={() => navigate("/")} className="cursor-pointer">
          <Wordmark />
        </button>
        <nav className="ml-12 hidden items-center gap-8 md:flex">
          {links.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {user ? (
            <Button variant="outline" size="sm" onClick={() => navigate("/app")} className="hidden sm:inline-flex">
              Dashboard
            </Button>
          ) : (
            <>
              <button
                onClick={() => navigate("/auth")}
                className="hidden px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign in
              </button>
              <Button size="sm" onClick={handleGetStarted} className="hidden sm:inline-flex">
                Join free beta
              </Button>
            </>
          )}
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="text-left text-sm font-medium py-2"
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <Button variant="outline" onClick={() => { setMobileOpen(false); navigate("/app"); }}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Sign in
                </Button>
                <Button onClick={handleGetStarted}>Join free beta</Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
