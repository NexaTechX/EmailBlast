import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { getCampaigns, getSubscribers } from "@/lib/api";
import { sendCampaign } from "@/lib/resend";
import { suggestSubjects } from "@/lib/groq-api";
import type { Campaign } from "@/types";
import { Plus, Trash2, Play, Trophy, Sparkles } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  subject: string;
}

interface AbTest {
  id: string;
  campaign_id: string;
  name: string;
  variants: Variant[];
  status: string;
  winner_variant_id: string | null;
  winner_metric: string | null;
}

export function ABTestingTool() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [testName, setTestName] = useState("");
  const [variants, setVariants] = useState<Variant[]>([
    { id: "a", name: "Variant A", subject: "" },
    { id: "b", name: "Variant B", subject: "" },
  ]);
  const [tests, setTests] = useState<AbTest[]>([]);
  const [activeTest, setActiveTest] = useState<AbTest | null>(null);
  const [results, setResults] = useState<Record<string, { opens: number; clicks: number; sent: number }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCampaigns().then(setCampaigns).catch(console.error);
    loadTests();
  }, []);

  const loadTests = async () => {
    const { data, error } = await supabase
      .from("ab_tests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setTests(data as AbTest[]);
  };

  const addVariant = () => {
    const id = String.fromCharCode(97 + variants.length);
    setVariants([
      ...variants,
      { id, name: `Variant ${id.toUpperCase()}`, subject: "" },
    ]);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 2) return;
    setVariants(variants.filter((v) => v.id !== id));
  };

  const createTest = async () => {
    if (!selectedCampaignId || !testName.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Select a campaign and enter a test name.",
      });
      return;
    }

    if (variants.some((v) => !v.subject.trim())) {
      toast({
        variant: "destructive",
        title: "Missing subjects",
        description: "Each variant needs a subject line.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ab_tests")
        .insert({
          campaign_id: selectedCampaignId,
          name: testName,
          variants,
          status: "draft",
          winner_metric: "open_rate",
        })
        .select()
        .single();

      if (error) throw error;
      setTests([data as AbTest, ...tests]);
      setTestName("");
      toast({ title: "A/B test created", description: "Ready to run." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create test.",
      });
    } finally {
      setLoading(false);
    }
  };

  const runTest = async (test: AbTest) => {
    const campaign = campaigns.find((c) => c.id === test.campaign_id);
    if (!campaign?.list_id) {
      toast({
        variant: "destructive",
        title: "No subscriber list",
        description: "The campaign must have a subscriber list assigned.",
      });
      return;
    }

    setLoading(true);
    try {
      const subscribers = await getSubscribers(campaign.list_id);
      const emails = subscribers
        .filter((s) => !s.unsubscribed_at)
        .map((s) => s.email);

      if (emails.length < test.variants.length) {
        toast({
          variant: "destructive",
          title: "Not enough subscribers",
          description: `Need at least ${test.variants.length} active subscribers.`,
        });
        return;
      }

      const chunkSize = Math.floor(emails.length / test.variants.length);

      for (let i = 0; i < test.variants.length; i++) {
        const variant = test.variants[i];
        const start = i * chunkSize;
        const end = i === test.variants.length - 1 ? emails.length : start + chunkSize;
        const batch = emails.slice(start, end);

        await sendCampaign(
          { ...campaign, subject: variant.subject },
          {
            recipients: batch,
            subjectOverride: variant.subject,
            variantId: variant.id,
            updateCampaignStatus: false,
          },
        );
      }

      await supabase
        .from("ab_tests")
        .update({ status: "running", start_date: new Date().toISOString() })
        .eq("id", test.id);

      await loadTests();
      toast({
        title: "Test started",
        description: `Sent ${test.variants.length} variants to your list.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Failed to run test",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (test: AbTest) => {
    setActiveTest(test);
    const { data } = await supabase
      .from("campaign_analytics")
      .select("event_type, email, metadata")
      .eq("campaign_id", test.campaign_id);

    const variantResults: Record<string, { opens: number; sent: number; clicks: number }> = {};
    const openSets: Record<string, Set<string>> = {};
    const clickSets: Record<string, Set<string>> = {};

    for (const v of test.variants) {
      variantResults[v.id] = { opens: 0, clicks: 0, sent: 0 };
      openSets[v.id] = new Set();
      clickSets[v.id] = new Set();
    }

    for (const event of data || []) {
      const meta = event.metadata as { variant_id?: string } | null;
      const variantId =
        meta?.variant_id ||
        (event as { variant_id?: string }).variant_id ||
        test.variants[0]?.id;

      if (!variantId || !variantResults[variantId]) continue;

      if (event.event_type === "sent") {
        variantResults[variantId].sent++;
      }
      if (event.event_type === "open" && event.email) {
        openSets[variantId].add(event.email);
      }
      if (event.event_type === "click" && event.email) {
        clickSets[variantId].add(event.email);
      }
    }

    for (const v of test.variants) {
      variantResults[v.id].opens = openSets[v.id].size;
      variantResults[v.id].clicks = clickSets[v.id].size;
    }

    setResults(variantResults);
  };

  const applyWinner = async (test: AbTest, variantId: string) => {
    const variant = test.variants.find((v) => v.id === variantId);
    if (!variant) return;

    await supabase
      .from("campaigns")
      .update({ subject: variant.subject })
      .eq("id", test.campaign_id);

    await supabase
      .from("ab_tests")
      .update({
        status: "completed",
        winner_variant_id: variantId,
        end_date: new Date().toISOString(),
      })
      .eq("id", test.id);

    await loadTests();
    toast({
      title: "Winner applied",
      description: `Campaign subject updated to "${variant.subject}"`,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Experiments
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">A/B Testing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Subject-line tests only. Each variant is tagged for per-variant analytics.
        </p>
      </div>

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create test</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6 mt-6">
          <Card className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Campaign</Label>
                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Test name</Label>
                <Input
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Subject line test"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Variants (subject lines)</Label>
              {variants.map((v) => (
                <div key={v.id} className="flex gap-2">
                  <Input
                    value={v.subject}
                    onChange={(e) =>
                      setVariants(
                        variants.map((x) =>
                          x.id === v.id ? { ...x, subject: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder={`${v.name} subject line`}
                  />
                  {variants.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(v.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-2" />
                Add variant
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loading || !selectedCampaignId}
                onClick={async () => {
                  const campaign = campaigns.find(
                    (c) => c.id === selectedCampaignId,
                  );
                  if (!campaign?.content) {
                    toast({
                      variant: "destructive",
                      title: "No content",
                      description: "Pick a campaign with email body content.",
                    });
                    return;
                  }
                  setLoading(true);
                  try {
                    const list = await suggestSubjects({
                      content: campaign.content,
                      subject: campaign.subject,
                    });
                    if (!list.length) throw new Error("No suggestions returned");
                    setVariants((prev) =>
                      prev.map((v, i) => ({
                        ...v,
                        subject: list[i]?.subject || v.subject,
                      })),
                    );
                    toast({
                      title: "Subjects filled",
                      description: "Review AI suggestions before running the test.",
                    });
                  } catch (err) {
                    toast({
                      variant: "destructive",
                      title: "Suggest failed",
                      description:
                        err instanceof Error ? err.message : "Try again",
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI fill subjects
              </Button>
            </div>

            <Button onClick={createTest} disabled={loading}>
              Create test
            </Button>
          </Card>

          <div className="space-y-3">
            <h3 className="font-semibold">Your tests</h3>
            {tests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tests yet.</p>
            ) : (
              tests.map((test) => (
                <Card key={test.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {test.status} · {test.variants.length} variants
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {test.status === "draft" && (
                      <Button size="sm" onClick={() => runTest(test)} disabled={loading}>
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => loadResults(test)}>
                      View results
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          {activeTest ? (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">{activeTest.name}</h3>
              {activeTest.variants.map((v) => {
                const r = results[v.id] || { opens: 0, clicks: 0, sent: 0 };
                const openRate =
                  r.sent > 0 ? ((r.opens / r.sent) * 100).toFixed(1) : "0";
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-4 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-sm text-muted-foreground">{v.subject}</p>
                      <p className="text-xs mt-1">
                        {r.opens} opens · {r.clicks} clicks · {openRate}% open rate
                      </p>
                    </div>
                    {activeTest.status === "running" && (
                      <Button size="sm" onClick={() => applyWinner(activeTest, v.id)}>
                        <Trophy className="h-4 w-4 mr-1" />
                        Apply winner
                      </Button>
                    )}
                  </div>
                );
              })}
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a test and click &quot;View results&quot; from the Create tab.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
