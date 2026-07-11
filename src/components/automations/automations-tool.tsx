import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  createAutomation,
  deleteAutomation,
  listAutomations,
  setAutomationStatus,
  type AutomationRow,
  type AutomationStep,
} from "@/lib/automations";
import { getSubscriberLists } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Play, Pause } from "lucide-react";
import type { SubscriberList } from "@/types";

const emptyStep = (): AutomationStep => ({
  delay_hours: 0,
  subject: "",
  content: "<p>Hello,</p><p>Thanks for subscribing.</p>",
});

export function AutomationsTool() {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<AutomationRow[]>([]);
  const [lists, setLists] = useState<SubscriberList[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [listId, setListId] = useState("");
  const [steps, setSteps] = useState<AutomationStep[]>([emptyStep()]);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [autos, subscriberLists, profile] = await Promise.all([
        listAutomations(),
        getSubscriberLists(),
        supabase
          .from("profiles")
          .select("default_sender_name, default_sender_email")
          .maybeSingle(),
      ]);
      setAutomations(autos);
      setLists(subscriberLists);
      if (!listId && subscriberLists[0]) setListId(subscriberLists[0].id);
      if (profile.data) {
        setSenderName(profile.data.default_sender_name || "");
        setSenderEmail(profile.data.default_sender_email || "");
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Failed to load automations",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !listId) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Name and list are required.",
      });
      return;
    }
    if (!senderName.trim() || !senderEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Sender required",
        description: "Set sender name and email in Settings → Sending first.",
      });
      return;
    }
    for (const step of steps) {
      if (!step.subject.trim() || !step.content.trim()) {
        toast({
          variant: "destructive",
          title: "Incomplete step",
          description: "Each step needs a subject and content.",
        });
        return;
      }
    }

    setCreating(true);
    try {
      await createAutomation({
        name: name.trim(),
        listId,
        steps,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
      });
      setName("");
      setSteps([emptyStep()]);
      toast({ title: "Automation created", description: "Activate it when ready." });
      await load();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Create failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (auto: AutomationRow) => {
    const next = auto.status === "active" ? "paused" : "active";
    try {
      await setAutomationStatus(auto.id, next);
      toast({
        title: next === "active" ? "Automation active" : "Automation paused",
      });
      await load();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this automation?")) return;
    try {
      await deleteAutomation(id);
      toast({ title: "Deleted" });
      await load();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    }
  };

  const listName = (id: string) =>
    lists.find((l) => l.id === id)?.name || "Unknown list";

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Automations
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Welcome drips
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Send a sequence of emails when someone joins a list. Up to 5 steps with
          delays between each.
        </p>
      </div>

      <Card className="space-y-4 p-6">
        <h3 className="text-lg font-semibold">Create automation</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="auto-name">Name</Label>
            <Input
              id="auto-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Welcome series"
            />
          </div>
          <div className="space-y-2">
            <Label>Trigger list</Label>
            <Select value={listId} onValueChange={setListId}>
              <SelectTrigger>
                <SelectValue placeholder="Select list" />
              </SelectTrigger>
              <SelectContent>
                {lists.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Step {idx + 1}</p>
                {steps.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSteps((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Delay (hours after previous)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={step.delay_hours}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSteps((prev) =>
                        prev.map((s, i) =>
                          i === idx
                            ? { ...s, delay_hours: Number.isFinite(v) ? v : 0 }
                            : s,
                        ),
                      );
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={step.subject}
                    onChange={(e) =>
                      setSteps((prev) =>
                        prev.map((s, i) =>
                          i === idx ? { ...s, subject: e.target.value } : s,
                        ),
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>HTML content</Label>
                <Textarea
                  rows={4}
                  value={step.content}
                  onChange={(e) =>
                    setSteps((prev) =>
                      prev.map((s, i) =>
                        i === idx ? { ...s, content: e.target.value } : s,
                      ),
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={steps.length >= 5}
            onClick={() =>
              setSteps((prev) => [
                ...prev,
                { delay_hours: 24, subject: "", content: "<p></p>" },
              ])
            }
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add step
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Creating..." : "Create automation"}
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Your automations</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : automations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No automations yet.</p>
        ) : (
          automations.map((auto) => {
            const triggerList =
              auto.triggers?.[0]?.list_id || "";
            const stepCount = auto.actions?.steps?.length || 0;
            return (
              <Card key={auto.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{auto.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {listName(triggerList)} · {stepCount} step
                    {stepCount === 1 ? "" : "s"} · {auto.status}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleStatus(auto)}
                >
                  {auto.status === "active" ? (
                    <>
                      <Pause className="mr-1 h-3.5 w-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-1 h-3.5 w-3.5" /> Activate
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(auto.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
