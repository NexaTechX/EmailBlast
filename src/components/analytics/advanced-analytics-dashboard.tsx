import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { getCampaignAnalytics } from "@/components/analytics/analytics-utils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import type { CampaignAnalytics } from "@/types";

interface AnalyticsSummary {
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
  totalEvents: number;
  revenue: number;
  conversions: number;
}

const eventDot = (type: CampaignAnalytics["event_type"]) => {
  switch (type) {
    case "open":
      return "bg-sky-500";
    case "click":
      return "bg-emerald-500";
    case "conversion":
      return "bg-violet-500";
    case "unsubscribe":
      return "bg-amber-500";
    case "bounce":
      return "bg-red-500";
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
  const [summary, setSummary] = useState<AnalyticsSummary>({
    opens: 0,
    clicks: 0,
    unsubscribes: 0,
    bounces: 0,
    totalEvents: 0,
    revenue: 0,
    conversions: 0,
  });
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week");

  useEffect(() => {
    if (campaignId && campaignId !== "undefined") {
      loadAnalytics();
    }
  }, [campaignId, timeframe]);

  const loadAnalytics = async () => {
    try {
      const { error: tableCheckError } = await supabase
        .from("campaign_analytics")
        .select("count")
        .limit(1);

      if (tableCheckError && tableCheckError.code === "42P01") {
        setAnalytics([]);
        calculateSummary([]);
        return;
      }

      const data = await getCampaignAnalytics(campaignId);
      setAnalytics(data);
      calculateSummary(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analytics. Please try again later.",
      });
    }
  };

  const calculateSummary = (data: CampaignAnalytics[]) => {
    const next = data.reduce(
      (acc, event) => {
        acc.totalEvents++;
        switch (event.event_type) {
          case "open":
            acc.opens++;
            break;
          case "click":
            acc.clicks++;
            break;
          case "unsubscribe":
            acc.unsubscribes++;
            break;
          case "bounce":
            acc.bounces++;
            break;
          case "conversion":
            acc.conversions++;
            if (event.metadata?.revenue) {
              acc.revenue += Number(event.metadata.revenue);
            }
            break;
        }
        return acc;
      },
      {
        opens: 0,
        clicks: 0,
        unsubscribes: 0,
        bounces: 0,
        totalEvents: 0,
        revenue: 0,
        conversions: 0,
      },
    );
    setSummary(next);
  };

  const rate = (n: number) =>
    summary.totalEvents > 0
      ? ((n / summary.totalEvents) * 100).toFixed(1)
      : "0";

  const tiles = [
    { label: "Opens", value: String(summary.opens), sub: `${rate(summary.opens)}% of events` },
    { label: "Clicks", value: String(summary.clicks), sub: `${rate(summary.clicks)}% of events` },
    {
      label: "Revenue",
      value: `$${summary.revenue.toFixed(2)}`,
      sub: `${summary.conversions} conversions`,
    },
    {
      label: "Unsubscribes",
      value: String(summary.unsubscribes),
      sub: `${summary.bounces} bounced`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Analytics
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {campaignId === "overview" ? "Overview" : "Campaign performance"}
          </h2>
        </div>
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

      {/* Stat tiles */}
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

      {/* Event stream */}
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
              Opens, clicks, and conversions will appear here once you send.
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
