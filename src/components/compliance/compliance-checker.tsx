import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Check, Info, RefreshCw } from "lucide-react";
import { analyzeCompliance, type ComplianceCheck } from "@/lib/compliance";

interface ComplianceCheckerProps {
  content?: string;
  subject?: string;
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
}: ComplianceCheckerProps) {
  const [checking, setChecking] = useState(false);
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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Compliance Checker</h3>
        <Button onClick={runComplianceCheck} disabled={checking}>
          {checking ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          {checking ? "Checking..." : "Run Check"}
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Compliance Score</h4>
            <Badge
              variant={
                complianceScore > 90
                  ? "default"
                  : complianceScore > 75
                    ? "secondary"
                    : "destructive"
              }
            >
              {complianceScore > 90
                ? "Excellent"
                : complianceScore > 75
                  ? "Good"
                  : "Needs Improvement"}
            </Badge>
          </div>
          <span className="text-lg font-bold">{complianceScore}%</span>
        </div>
        <Progress value={complianceScore} className="h-2" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          <TabsTrigger value="canspam">CAN-SPAM</TabsTrigger>
          <TabsTrigger value="ccpa">CCPA</TabsTrigger>
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
    </Card>
  );
}
