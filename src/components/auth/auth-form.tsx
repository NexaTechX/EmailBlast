import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { signUpSchema } from "@/lib/validations";
import { client } from "@/lib/neon";
import { MailCheck } from "lucide-react";

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

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { signIn, signUp, verifyEmailOtp, resendVerification } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const errorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await client.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      toast({
        title: "Reset email sent",
        description: `Check ${resetEmail} for password reset instructions.`,
      });
      setShowForgot(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't send reset email",
        description: errorMessage(error, "Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        navigate("/app", { replace: true });
      } else {
        const validation = signUpSchema.safeParse({
          email,
          password,
          confirmPassword: password,
        });
        if (!validation.success) {
          toast({
            variant: "destructive",
            title: "Validation error",
            description: validation.error.errors[0].message,
          });
          return;
        }
        const { needsVerification } = await signUp(
          email,
          password,
          name.trim() || undefined,
        );
        if (needsVerification) {
          setPendingEmail(email);
        } else {
          navigate("/app", { replace: true });
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
      const { hasSession } = await verifyEmailOtp(
        pendingEmail,
        code.trim(),
        password,
      );
      if (hasSession) {
        toast({ title: "Email verified", description: "Welcome to EmailBlast." });
        navigate("/app", { replace: true });
      } else {
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

  if (showForgot) {
    return (
      <div className="space-y-7">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send reset instructions.
          </p>
        </div>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <LabeledInput
            id="reset-email"
            label="Email"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setShowForgot(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to sign in
        </button>
      </div>
    );
  }

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
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowForgot(true);
                }}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Forgot?
              </button>
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
        <Link
          to="/legal/terms"
          className="text-foreground underline underline-offset-2"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          to="/legal/privacy"
          className="text-foreground underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
