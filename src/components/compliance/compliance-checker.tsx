import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Check,
  Info,
  RefreshCw,
} from "lucide-react";
import { analyzeCompliance, type ComplianceCheck } from "@/lib/compliance";
import { enhanceContent } from "@/lib/groq-api";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ComplianceCheckerProps {
  content?: string;
  subject?: string;
  onContentChange?: (content: string) => void;
  compact?: boolean;
}

function StatusIcon({ status }: { status: ComplianceCheck["status"] }) {
  switch (status) {
    case "pass":
      return <Check className="h-5 w-5 text-green-500 mt-0.5" />;
    case "warn":
      return <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />;
    case "fail":
      return <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />;
    default:
      return <Info className="h-5 w-5 text-blue-500 mt-0.5" />;
  }
}

function CheckList({ items }: { items: ComplianceCheck[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No checks in this category.</p>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 p-3 border rounded-md">
          <StatusIcon status={item.status} />
          <div>
            <h5 className="font-medium">{item.label}</h5>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ComplianceChecker({
  content = "",
  subject = "",
  onContentChange,
  compact = false,
}: ComplianceCheckerProps) {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [result, setResult] = useState(() =>
    analyzeCompliance(content, subject),
  );

  useEffect(() => {
    setResult(analyzeCompliance(content, subject));
  }, [content, subject]);

  const runComplianceCheck = () => {
    setChecking(true);
    setResult(analyzeCompliance(content, subject));
    setTimeout(() => setChecking(false), 300);
  };

  const failed = result.checks.filter(
    (c) => c.status === "fail" || c.status === "warn",
  );

  const fixWithAi = async () => {
    if (!onContentChange) return;
    if (failed.length === 0) {
      toast({ title: "Nothing to fix", description: "No warnings or failures." });
      return;
    }
    setFixing(true);
    try {
      const instructions = [
        "Improve this HTML email for compliance. Keep meaning and structure.",
        "Address these issues:",
        ...failed.map((c) => `- ${c.label}: ${c.description}`),
        "Add clear unsubscribe language in the body if missing.",
        "Soften spammy marketing phrases. Do not invent a fake postal address.",
        "Return ONLY HTML.",
      ].join("\n");
      const next = await enhanceContent(content, instructions);
      onContentChange(next);
      setResult(analyzeCompliance(next, subject));
      toast({
        title: "Compliance rewrite applied",
        description: "Review the email before sending.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Fix failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setFixing(false);
    }
  };

  const complianceScore = result.score;
  const byCategory = useMemo(
    () => ({
      overview: result.checks.filter((c) => c.category === "overview"),
      gdpr: result.checks.filter((c) => c.category === "gdpr"),
      canspam: result.checks.filter((c) => c.category === "canspam"),
      ccpa: result.checks.filter((c) => c.category === "ccpa"),
    }),
    [result],
  );

  return (
    <div className={cn(compact ? "space-y-4" : "rounded-lg border border-border p-6")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className={cn("font-semibold tracking-tight", compact ? "text-sm" : "text-lg")}>
            Compliance
          </h3>
          {!compact && (
            <p className="text-sm text-muted-foreground">
              Heuristic checks before you send.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {onContentChange && (
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={fixWithAi}
              disabled={fixing || failed.length === 0}
            >
              {fixing ? (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : null}
              Fix with AI
            </Button>
          )}
          <Button
            size={compact ? "sm" : "default"}
            variant={compact ? "secondary" : "default"}
            onClick={runComplianceCheck}
            disabled={checking}
          >
            {checking ? "Checking…" : "Re-check"}
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Score
          </span>
          <span className="font-mono text-sm tabular-nums font-semibold">
            {complianceScore}/100
          </span>
        </div>
        <Progress value={complianceScore} className="h-1.5" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={cn("mb-3", compact && "h-8")}>
          <TabsTrigger value="overview" className={compact ? "text-xs" : undefined}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="gdpr" className={compact ? "text-xs" : undefined}>
            GDPR
          </TabsTrigger>
          <TabsTrigger value="canspam" className={compact ? "text-xs" : undefined}>
            CAN-SPAM
          </TabsTrigger>
          <TabsTrigger value="ccpa" className={compact ? "text-xs" : undefined}>
            CCPA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <CheckList items={byCategory.overview} />
        </TabsContent>
        <TabsContent value="gdpr">
          <CheckList items={byCategory.gdpr} />
        </TabsContent>
        <TabsContent value="canspam">
          <CheckList items={byCategory.canspam} />
        </TabsContent>
        <TabsContent value="ccpa">
          <CheckList items={byCategory.ccpa} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
