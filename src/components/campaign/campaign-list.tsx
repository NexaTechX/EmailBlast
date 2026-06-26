import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, BarChart3, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCampaigns } from "@/lib/api";
import type { Campaign } from "@/types";

// Maps a campaign status to its status-dot colour class.
const statusDot = (status: Campaign["status"]) => {
  switch (status) {
    case "sent":
      return "bg-emerald-500";
    case "sending":
      return "bg-amber-500";
    case "scheduled":
      return "bg-sky-500";
    case "failed":
      return "bg-red-500";
    default:
      return "bg-muted-foreground/40";
  }
};

// Lists the signed-in user's campaigns with status and quick actions.
export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetches the campaign list into state.
  const loadCampaigns = async () => {
    setLoading(true);
    try {
      setCampaigns(await getCampaigns());
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Campaigns
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            All campaigns
          </h2>
        </div>
        <Button onClick={() => navigate("/app/campaigns/new")}>
          <Plus className="mr-1.5 h-4 w-4" />
          New campaign
        </Button>
      </div>

      {/* List */}
      <div className="border">
        <div className="hidden items-center gap-4 border-b px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:flex">
          <span className="flex-1">Campaign</span>
          <span className="w-32">Status</span>
          <span className="w-24">Sent</span>
          <span className="w-[72px] text-right">Actions</span>
        </div>

        {loading ? (
          <div className="divide-y">
            {[0, 1, 2].map((i) => (
              <div key={i} className="px-5 py-4">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Send className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium">No campaigns yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first campaign to get started.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={() => navigate("/app/campaigns/new")}
            >
              Create campaign
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
              >
                <button
                  onClick={() => navigate(`/app/campaigns/${c.id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.subject}
                  </p>
                </button>

                <span className="hidden w-32 items-center gap-1.5 font-mono text-xs capitalize text-muted-foreground sm:inline-flex">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusDot(c.status)}`}
                  />
                  {c.status}
                </span>
                <span className="hidden w-24 font-mono text-xs text-muted-foreground sm:block">
                  {c.sent_at
                    ? new Date(c.sent_at).toLocaleDateString()
                    : "—"}
                </span>
                <span
                  className={`h-2 w-2 rounded-full sm:hidden ${statusDot(c.status)}`}
                />

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigate(`/app/campaigns/${c.id}`)}
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.75} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      navigate(`/app/campaigns/${c.id}/analytics`)
                    }
                  >
                    <BarChart3 className="h-4 w-4" strokeWidth={1.75} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
