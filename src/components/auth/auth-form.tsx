import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { MailCheck } from "lucide-react";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        navigate("/app");
      } else {
        const { needsVerification } = await signUp(email, password);
        if (needsVerification) {
          setPendingEmail(email);
        } else {
          navigate("/app");
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred during authentication";
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Verification-pending screen — the account was created but Neon Auth requires
  // the user to confirm their email before a session is issued.
  if (pendingEmail) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border bg-card">
          <MailCheck className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your inbox
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{pendingEmail}</span>.
            Confirm it to activate your account, then sign in.
          </p>
        </div>
        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-left">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Next step
          </p>
          <p className="mt-1 text-sm">
            Open the email and follow the link. Don&apos;t see it? Check your
            spam folder.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-11 w-full"
          onClick={() => {
            setPendingEmail(null);
            setMode("login");
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to your EmailBlast workspace."
            : "Start sending in minutes — no card required."}
        </p>
      </div>

      {/* Segmented toggle */}
      <div className="inline-flex w-full rounded-lg border p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              Password
            </label>
            {mode === "login" && (
              <span className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">
                Forgot?
              </span>
            )}
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11"
          />
        </div>

        <Button type="submit" className="h-11 w-full" disabled={loading}>
          {loading
            ? "Please wait…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        By continuing you agree to our{" "}
        <span className="cursor-pointer text-foreground underline underline-offset-2">
          Terms
        </span>{" "}
        and{" "}
        <span className="cursor-pointer text-foreground underline underline-offset-2">
          Privacy Policy
        </span>
        .
      </p>
    </div>
  );
}
