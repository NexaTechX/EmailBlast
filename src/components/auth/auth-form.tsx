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
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { signIn, signUp, verifyEmailOtp, resendVerification } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const errorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

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
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: errorMessage(error, "An error occurred during authentication"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingEmail) return;
    setVerifying(true);
    try {
      await verifyEmailOtp(pendingEmail, code.trim());
      toast({ title: "Email verified", description: "Welcome to EmailBlast." });
      navigate("/app");
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: errorMessage(error, "That code is invalid or expired."),
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    try {
      await resendVerification(pendingEmail);
      toast({
        title: "Code resent",
        description: `We sent a new code to ${pendingEmail}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't resend",
        description: errorMessage(error, "Please try again in a moment."),
      });
    }
  };

  // Verification screen — the account was created but Neon Auth requires the
  // email code before a session is issued.
  if (pendingEmail) {
    return (
      <div className="space-y-7">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border bg-card">
            <MailCheck className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Enter the code we sent to{" "}
            <span className="font-medium text-foreground">{pendingEmail}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="code"
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              Verification code
            </label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\s/g, ""))
              }
              required
              className="h-12 text-center font-mono text-lg tracking-[0.5em]"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={verifying || code.trim().length < 4}
          >
            {verifying ? "Verifying…" : "Verify & continue"}
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Resend code
          </button>
          <button
            type="button"
            onClick={() => {
              setPendingEmail(null);
              setCode("");
              setMode("login");
            }}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to sign in
          </button>
        </div>
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
