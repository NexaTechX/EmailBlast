import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  SplitSquareVertical,
  BarChart,
  Sparkles,
  Plus,
  Trash,
  Copy,
} from "lucide-react";

export function ABTestingTool() {
  const [variants, setVariants] = useState([
    {
      id: 1,
      name: "Variant A",
      subject: "Discover our new features",
      openRate: 24.5,
    },
    {
      id: 2,
      name: "Variant B",
      subject: "New features just for you",
      openRate: 28.7,
    },
  ]);

  const addVariant = () => {
    const newId = Math.max(...variants.map((v) => v.id)) + 1;
    setVariants([
      ...variants,
      {
        id: newId,
        name: `Variant ${String.fromCharCode(65 + variants.length)}`, // A, B, C, etc.
        subject: "",
        openRate: 0,
      },
    ]);
  };

  const removeVariant = (id: number) => {
    if (variants.length <= 2) return; // Keep at least 2 variants
    setVariants(variants.filter((v) => v.id !== id));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">A/B Testing</h3>
        <Button
          variant="outline"
          onClick={addVariant}
          disabled={variants.length >= 5}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      <Tabs defaultValue="setup">
        <TabsList className="mb-6">
          <TabsTrigger value="setup">Test Setup</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="ai">AI Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Test Elements</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                  <div>
                    <h5 className="font-medium">Subject Line</h5>
                    <p className="text-xs text-muted-foreground">
                      Test different subject lines
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-md flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4" />
                  <div>
                    <h5 className="font-medium">Email Content</h5>
                    <p className="text-xs text-muted-foreground">
                      Test different email bodies
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-md flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4" />
                  <div>
                    <h5 className="font-medium">Send Time</h5>
                    <p className="text-xs text-muted-foreground">
                      Test different sending times
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Test Variants</Label>
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="p-4 border rounded-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{variant.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Distribution: {Math.floor(100 / variants.length)}%
                      </span>
                    </div>
                    {variants.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(variant.id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`subject-${variant.id}`}>
                      Subject Line
                    </Label>
                    <Input
                      id={`subject-${variant.id}`}
                      placeholder="Enter subject line"
                      value={variant.subject}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        const idx = newVariants.findIndex(
                          (v) => v.id === variant.id,
                        );
                        newVariants[idx].subject = e.target.value;
                        setVariants(newVariants);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Test Settings</Label>
              <div className="p-4 border rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Sample Size</h5>
                    <p className="text-sm text-muted-foreground">
                      Percentage of your audience to include in the test
                    </p>
                  </div>
                  <div className="w-32">
                    <Input type="number" min="10" max="100" defaultValue="20" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Winner Selection</h5>
                    <p className="text-sm text-muted-foreground">
                      Metric to determine the winning variant
                    </p>
                  </div>
                  <select className="p-2 border rounded-md">
                    <option>Open Rate</option>
                    <option>Click Rate</option>
                    <option>Conversion Rate</option>
                    <option>Revenue</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Auto-Send Winner</h5>
                    <p className="text-sm text-muted-foreground">
                      Automatically send the winning variant to remaining
                      audience
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-4">Test Results</h4>

              <div className="space-y-6">
                {variants.map((variant) => (
                  <div key={variant.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {variant.openRate ===
                          Math.max(...variants.map((v) => v.openRate)) && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Winner
                          </Badge>
                        )}
                        <span className="font-medium">{variant.name}</span>
                      </div>
                      <span className="font-bold">{variant.openRate}%</span>
                    </div>
                    <Progress value={variant.openRate} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Subject: {variant.subject}</span>
                      <span>
                        Sent to: {Math.floor(1000 / variants.length)} recipients
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <h5 className="font-medium mb-2">Statistical Significance</h5>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    95% Confidence
                  </Badge>
                  <span className="text-sm">
                    Results are statistically significant
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <BarChart className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <SplitSquareVertical className="h-4 w-4 mr-2" />
                Apply Winner
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">AI-Powered Optimization</h4>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  Premium Feature
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Let our AI analyze your campaign and generate optimized variants
                based on your audience and past performance data.
              </p>

              <div className="space-y-2">
                <Label>Optimization Target</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Maximize Open Rate</option>
                  <option>Maximize Click-Through Rate</option>
                  <option>Maximize Conversion Rate</option>
                  <option>Maximize Revenue</option>
                </select>
              </div>

              <Button className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Variants
              </Button>
            </div>

            <div className="p-4 border rounded-md space-y-4">
              <h4 className="font-semibold">AI Suggestions</h4>

              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-md">
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium">Subject Line Suggestion</h5>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm mt-1">
                    "Exclusive: See what's new with our latest features"
                  </p>
                </div>

                <div className="p-3 bg-muted/30 rounded-md">
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium">Call-to-Action Suggestion</h5>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm mt-1">"Upgrade Now and Get 20% Off"</p>
                </div>

                <div className="p-3 bg-muted/30 rounded-md">
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium">Send Time Suggestion</h5>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm mt-1">
                    Tuesday at 10:30 AM (recipient's local time)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
