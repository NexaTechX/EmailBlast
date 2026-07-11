import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background transition-transform duration-200 hover:scale-105">
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    {
      label: "About",
      action: () => {
        setMobileOpen(false);
        navigate("/about");
      },
    },
    {
      label: "Pricing",
      action: () => {
        setMobileOpen(false);
        navigate("/pricing");
      },
    },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-[background,border-color,box-shadow] duration-300 ${
        scrolled
          ? "border-border/80 bg-background/90 shadow-sm shadow-foreground/[0.03] backdrop-blur-xl"
          : "border-transparent bg-background/60 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6 lg:px-8">
        <button onClick={() => navigate("/")} className="cursor-pointer">
          <Wordmark />
        </button>
        <nav className="ml-10 hidden items-center gap-7 md:flex">
          {links.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="relative text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/app")}
              className="hidden sm:inline-flex"
            >
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
              <Button
                size="sm"
                onClick={handleGetStarted}
                className="hidden transition-transform duration-200 hover:scale-[1.02] sm:inline-flex"
              >
                Start for free
              </Button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="rounded-md py-2.5 text-left text-sm font-medium"
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t pt-3">
                {user ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/app");
                    }}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => navigate("/auth")}>
                      Sign in
                    </Button>
                    <Button onClick={handleGetStarted}>Start for free</Button>
                  </>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
