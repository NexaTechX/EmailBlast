import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { MailCheck } from "lucide-react";

// Labelled input row with an optional trailing action (e.g. a "Forgot?" link).
// Extracted so the form markup stays shallow.
function LabeledInput({
  id,
  label,
  action,
  ...inputProps
}: {
  id: string;
  label: string;
  action?: React.ReactNode;
} & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
        {action}
      </div>
      <Input id={id} className="h-11" {...inputProps} />
    </div>
  );
}

// Sign-in / sign-up form with an inline email-verification (OTP) step.
export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { signIn, signUp, verifyEmailOtp, resendVerification } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Returns a user-facing message from an unknown error, with a fallback.
  const errorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  // Handles sign in or sign up; routes to the verification step when needed.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        navigate("/app");
      } else {
        const { needsVerification } = await signUp(
          email,
          password,
          name.trim() || undefined,
        );
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

  // Submits the emailed OTP code to establish a session.
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingEmail) return;
    setVerifying(true);
    try {
      const { hasSession } = await verifyEmailOtp(
        pendingEmail,
        code.trim(),
        password,
      );
      if (hasSession) {
        toast({ title: "Email verified", description: "Welcome to EmailBlast." });
        navigate("/app");
      } else {
        // Email is verified but no session was opened (e.g. the password isn't
        // in state after a reload). Send them to sign in rather than bounce off
        // a protected route.
        toast({
          title: "Email verified",
          description: "Please sign in to continue.",
        });
        setPendingEmail(null);
        setCode("");
        setMode("login");
      }
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

  // Requests a fresh verification code for the pending email.
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
          <LabeledInput
            id="code"
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
            required
            className="h-12 text-center font-mono text-lg tracking-[0.5em]"
          />

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
        {mode === "register" && (
          <LabeledInput
            id="name"
            label="Name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <LabeledInput
          id="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <LabeledInput
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          action={
            mode === "login" ? (
              <span className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">
                Forgot?
              </span>
            ) : null
          }
        />

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
