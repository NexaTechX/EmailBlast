import { AuthForm } from "@/components/auth/auth-form";
import { useNavigate } from "react-router-dom";

function Wordmark({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-md ${
          inverted ? "bg-background text-foreground" : "bg-foreground text-background"
        }`}
      >
        <span className="text-sm font-bold">E</span>
      </div>
      <span className="text-[15px] font-semibold tracking-tight">EmailBlast</span>
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — inverted editorial panel */}
      <div className="relative hidden flex-col justify-between bg-foreground p-12 text-background lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <button
          onClick={() => navigate("/")}
          className="relative cursor-pointer self-start"
        >
          <Wordmark inverted />
        </button>

        <div className="relative max-w-md">
          <p className="font-mono text-xs uppercase tracking-widest text-background/50">
            Why teams switch
          </p>
          <blockquote className="mt-5 text-2xl font-medium leading-snug tracking-tight">
            “We replaced three tools with EmailBlast and{" "}
            <span className="text-emerald-400">doubled our open rates</span> in a
            single quarter.”
          </blockquote>
          <figcaption className="mt-6 text-sm">
            <p className="font-semibold">Sarah Chen</p>
            <p className="font-mono text-background/50">Head of Growth, Lumen</p>
          </figcaption>
        </div>

        <div className="relative flex items-center gap-8 border-t border-background/15 pt-6 font-mono text-xs text-background/60">
          <span>
            <span className="text-background">12,000+</span> teams
          </span>
          <span>
            <span className="text-background">10M+</span> emails / mo
          </span>
          <span>
            <span className="text-background">99.2%</span> delivered
          </span>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-col px-6 py-8 lg:px-0">
        <div className="lg:hidden">
          <button onClick={() => navigate("/")} className="cursor-pointer">
            <Wordmark />
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
}
