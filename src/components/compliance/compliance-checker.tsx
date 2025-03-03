import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Check, Info, RefreshCw } from "lucide-react";

export function ComplianceChecker({ content = "" }) {
  const [complianceScore, setComplianceScore] = useState(85);
  const [checking, setChecking] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const runComplianceCheck = () => {
    setChecking(true);
    // Simulate compliance check
    setTimeout(() => {
      setChecking(false);
      setComplianceScore(Math.floor(Math.random() * 30) + 70); // Random score between 70-100
    }, 1500);
  };

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
                  ? "success"
                  : complianceScore > 75
                    ? "warning"
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

        <TabsContent value="overview" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-md">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Unsubscribe Link</h5>
                <p className="text-sm text-muted-foreground">
                  Your email includes a clear unsubscribe link.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Physical Address</h5>
                <p className="text-sm text-muted-foreground">
                  Your email includes your physical business address.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Spam Trigger Words</h5>
                <p className="text-sm text-muted-foreground">
                  Your email contains 2 potential spam trigger words.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Consent Records</h5>
                <p className="text-sm text-muted-foreground">
                  Make sure you have proper consent records for all recipients.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gdpr" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-md">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Explicit Consent</h5>
                <p className="text-sm text-muted-foreground">
                  Your subscribers have provided explicit consent.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Right to Be Forgotten</h5>
                <p className="text-sm text-muted-foreground">
                  Your unsubscribe process complies with data deletion
                  requirements.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Privacy Policy</h5>
                <p className="text-sm text-muted-foreground">
                  Your email includes a link to your privacy policy.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="canspam" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-md">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Accurate From Line</h5>
                <p className="text-sm text-muted-foreground">
                  Your "From" line accurately identifies the sender.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Non-Deceptive Subject Line</h5>
                <p className="text-sm text-muted-foreground">
                  Your subject line accurately reflects the content of the
                  email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Opt-Out Mechanism</h5>
                <p className="text-sm text-muted-foreground">
                  Your email includes a clear and conspicuous opt-out mechanism.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ccpa" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-md">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Right to Know</h5>
                <p className="text-sm text-muted-foreground">
                  Your privacy policy informs California residents of their
                  rights.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Do Not Sell My Info</h5>
                <p className="text-sm text-muted-foreground">
                  Your website includes a "Do Not Sell My Personal Information"
                  link.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h5 className="font-medium">Data Inventory</h5>
                <p className="text-sm text-muted-foreground">
                  Ensure you maintain a comprehensive inventory of personal
                  information collected.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
