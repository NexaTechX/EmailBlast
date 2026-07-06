import { useState, useEffect } from "react";
import { Activity, Download } from "lucide-react";
import { getCampaignAnalytics } from "@/components/analytics/analytics-utils";
import { getCampaigns } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CampaignAnalytics, Campaign } from "@/types";

interface AnalyticsSummary {
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
  sent: number;
  totalEvents: number;
}

const eventDot = (type: CampaignAnalytics["event_type"]) => {
  switch (type) {
    case "open":
      return "bg-sky-500";
    case "click":
      return "bg-emerald-500";
    case "unsubscribe":
      return "bg-amber-500";
    case "bounce":
      return "bg-red-500";
    case "sent":
      return "bg-violet-500";
    default:
      return "bg-muted-foreground/40";
  }
};

export function AdvancedAnalyticsDashboard({
  campaignId,
}: {
  campaignId: string;
}) {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<CampaignAnalytics[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState(campaignId);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    opens: 0,
    clicks: 0,
    unsubscribes: 0,
    bounces: 0,
    sent: 0,
    totalEvents: 0,
  });
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week");

  const calculateSummary = (data: CampaignAnalytics[]) => {
    const uniqueOpens = new Set<string>();
    const uniqueClicks = new Set<string>();

    const next = data.reduce(
      (acc, event) => {
        acc.totalEvents++;
        const key = `${event.email || event.subscriber_id}-${event.event_type}`;
        switch (event.event_type) {
          case "open":
            if (event.email) uniqueOpens.add(event.email);
            acc.opens = uniqueOpens.size;
            break;
          case "click":
            if (event.email) uniqueClicks.add(event.email);
            acc.clicks = uniqueClicks.size;
            break;
          case "unsubscribe":
            acc.unsubscribes++;
            break;
          case "bounce":
            acc.bounces++;
            break;
          case "sent":
            acc.sent++;
            break;
          default:
            break;
        }
        return acc;
      },
      {
        opens: 0,
        clicks: 0,
        unsubscribes: 0,
        bounces: 0,
        sent: 0,
        totalEvents: 0,
      },
    );
    setSummary(next);
  };

  useEffect(() => {
    if (campaignId === "overview") {
      getCampaigns().then((list) => {
        setCampaigns(list);
        if (list.length > 0 && selectedCampaign === "overview") {
          setSelectedCampaign(list[0].id);
        }
      }).catch(console.error);
    } else {
      setSelectedCampaign(campaignId);
    }
  }, [campaignId]);

  useEffect(() => {
    const id = campaignId === "overview" ? selectedCampaign : campaignId;
    if (id && id !== "undefined" && id !== "overview") {
      loadAnalytics(id);
    }
  }, [campaignId, selectedCampaign, timeframe]);

  const loadAnalytics = async (id: string = selectedCampaign) => {
    try {
      const data = await getCampaignAnalytics(id, timeframe);
      setAnalytics(data as CampaignAnalytics[]);
      calculateSummary(data as CampaignAnalytics[]);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analytics. Please try again later.",
      });
    }
  };

  const handleExport = () => {
    if (analytics.length === 0) return;
    const header = "event_type,email,occurred_at";
    const rows = analytics.map(
      (e) =>
        `${e.event_type},"${(e.email || "").replace(/"/g, '""')}",${e.occurred_at}`,
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${selectedCampaign}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openRate =
    summary.sent > 0
      ? ((summary.opens / summary.sent) * 100).toFixed(1)
      : "0";
  const clickRate =
    summary.opens > 0
      ? ((summary.clicks / summary.opens) * 100).toFixed(1)
      : "0";

  const tiles = [
    {
      label: "Sent",
      value: String(summary.sent),
      sub: "Emails delivered",
    },
    {
      label: "Opens",
      value: String(summary.opens),
      sub: `${openRate}% open rate`,
    },
    {
      label: "Clicks",
      value: String(summary.clicks),
      sub: `${clickRate}% click-through`,
    },
    {
      label: "Unsubscribes",
      value: String(summary.unsubscribes),
      sub: `${summary.bounces} bounced`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Analytics
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {campaignId === "overview" ? "Overview" : "Campaign performance"}
          </h2>
          {campaignId === "overview" && campaigns.length > 0 && (
            <div className="mt-3 max-w-xs">
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
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
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {analytics.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          )}
          <div className="inline-flex rounded-lg border p-1">
          {(["day", "week", "month"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                timeframe === t
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y border lg:grid-cols-4 lg:divide-y-0">
        {tiles.map((t) => (
          <div key={t.label} className="p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t.label}
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums tracking-tight">
              {t.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t.sub}</p>
          </div>
        ))}
      </div>

      <div className="border">
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <h3 className="text-sm font-semibold">Recent events</h3>
          <span className="font-mono text-xs text-muted-foreground">
            {summary.totalEvents} total
          </span>
        </div>

        {analytics.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Activity className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium">No events yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Opens, clicks, and unsubscribes will appear here once you send.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {analytics.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <span className="inline-flex w-32 items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${eventDot(event.event_type)}`}
                  />
                  <span className="text-sm capitalize">{event.event_type}</span>
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                  {event.email || event.subscriber_id || "—"}
                </span>
                <span className="hidden font-mono text-xs text-muted-foreground sm:block">
                  {new Date(event.occurred_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
