import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getSubscriberLists } from "@/lib/api";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  href: string;
}

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const refreshChecklist = async () => {
    if (!user?.id) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("mailing_address, onboarding_completed_at")
      .eq("id", user.id)
      .maybeSingle();

    let lists: { id: string }[] = [];
    try {
      lists = await getSubscriberLists();
    } catch {
      /* ignore */
    }

    const { count: subCount } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true });

    const { count: campaignCount } = await supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true });

    const { count: sentCount } = await supabase
      .from("campaign_analytics")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "sent");

    setChecklist([
      {
        id: "address",
        label: "Add mailing address (Settings → Sending)",
        done: Boolean(profile?.mailing_address?.trim()),
        href: "/app/settings/sending",
      },
      {
        id: "list",
        label: "Create or confirm a subscriber list",
        done: lists.length > 0,
        href: "/app/subscribers",
      },
      {
        id: "import",
        label: "Import subscribers",
        done: (subCount ?? 0) > 0,
        href: "/app/subscribers",
      },
      {
        id: "campaign",
        label: "Create a campaign and send a test",
        done: (campaignCount ?? 0) > 0,
        href: "/app/campaigns/new",
      },
      {
        id: "analytics",
        label: "View analytics after sending",
        done: (sentCount ?? 0) > 0,
        href: "/app/analytics",
      },
    ]);

    if (!profile?.onboarding_completed_at) {
      setOpen(true);
    }
  };

  useEffect(() => {
    if (user) refreshChecklist();
  }, [user?.id]);

  const handleComplete = async () => {
    if (user?.id) {
      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          onboarding_completed_at: new Date().toISOString(),
        });
    }
    setOpen(false);
  };

  const completed = checklist.filter((c) => c.done).length;
  const progress =
    checklist.length > 0 ? (completed / checklist.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to EmailBlast</DialogTitle>
          <DialogDescription>
            Free beta — complete this checklist to send your first campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {completed} of {checklist.length} complete
          </p>

          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate(item.href);
                  }}
                  className="flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm hover:bg-muted/50"
                >
                  {item.done ? (
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={item.done ? "text-muted-foreground" : ""}>
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Remind me later
          </Button>
          <Button onClick={handleComplete}>Dismiss checklist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
