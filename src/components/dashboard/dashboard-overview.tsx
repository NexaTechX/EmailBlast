import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  Users,
  BarChart3,
  ArrowUpRight,
  Radar,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import type { Campaign } from "@/types";
import {
  FREE_MONTHLY_EMAIL_LIMIT,
  FREE_SUBSCRIBER_LIMIT,
} from "@/lib/plan-limits";
import {
  countActiveSubscribers,
  countEmailsSentThisMonth,
} from "@/lib/quota";

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSubscribers: number;
  activeSubscribers: number;
  averageOpenRate: number;
  averageClickRate: number;
  emailsSentThisMonth: number;
}

export function DashboardOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSubscribers: 0,
    activeSubscribers: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
    emailsSentThisMonth: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { count: totalCampaigns, error: countError } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      const { data: campaigns, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (campaignsError) throw campaignsError;

      const { data: subscribers, error: subscribersError } = await supabase
        .from("subscribers")
        .select("unsubscribed_at");

      if (subscribersError) throw subscribersError;

      const { data: analytics, error: analyticsError } = await supabase
        .from("campaign_analytics")
        .select("event_type, email");

      if (analyticsError) throw analyticsError;

      const activeSubscribers =
        subscribers?.filter((s) => !s.unsubscribed_at) || [];

      const sentCount =
        analytics?.filter((a) => a.event_type === "sent").length || 0;
      const uniqueOpens = new Set(
        analytics
          ?.filter((a) => a.event_type === "open" && a.email)
          .map((a) => a.email) || [],
      );
      const uniqueClicks = new Set(
        analytics
          ?.filter((a) => a.event_type === "click" && a.email)
          .map((a) => a.email) || [],
      );

      const openRate =
        sentCount > 0 ? (uniqueOpens.size / sentCount) * 100 : 0;
      const clickRate =
        uniqueOpens.size > 0 ? (uniqueClicks.size / uniqueOpens.size) * 100 : 0;

      const [activeCount, emailsThisMonth] = await Promise.all([
        countActiveSubscribers(),
        countEmailsSentThisMonth(),
      ]);

      setStats({
        totalCampaigns: totalCampaigns || 0,
        activeCampaigns:
          campaigns?.filter(
            (c) => c.status === "scheduled" || c.status === "sending",
          ).length || 0,
        totalSubscribers: subscribers?.length || 0,
        activeSubscribers: activeCount || activeSubscribers.length,
        averageOpenRate: Math.round(openRate * 10) / 10,
        averageClickRate: Math.round(clickRate * 10) / 10,
        emailsSentThisMonth: emailsThisMonth,
      });

      setRecentCampaigns((campaigns || []) as Campaign[]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const statTiles = [
    {
      label: "Campaigns",
      value: stats.totalCampaigns,
      sub:
        stats.activeCampaigns > 0
          ? `${stats.activeCampaigns} active`
          : "All time",
      to: "/app/campaigns",
    },
    {
      label: "Subscribers",
      value: `${stats.activeSubscribers}/${FREE_SUBSCRIBER_LIMIT}`,
      sub: `${Math.max(0, FREE_SUBSCRIBER_LIMIT - stats.activeSubscribers)} slots left`,
      to: "/app/subscribers",
    },
    {
      label: "Emails this month",
      value: `${stats.emailsSentThisMonth}/${FREE_MONTHLY_EMAIL_LIMIT}`,
      sub: `${Math.max(0, FREE_MONTHLY_EMAIL_LIMIT - stats.emailsSentThisMonth)} remaining`,
      to: "/app/analytics",
    },
    {
      label: "Open rate",
      value: `${stats.averageOpenRate}%`,
      sub: "Unique opens / sent",
      to: "/app/analytics",
    },
  ];

  const quickActions = [
    { label: "Create campaign", icon: Send, to: "/app/campaigns/new" },
    { label: "Import subscribers", icon: Users, to: "/app/subscribers" },
    { label: "View analytics", icon: BarChart3, to: "/app/analytics" },
    { label: "Find new leads", icon: Radar, to: "/app/lead-finder" },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 divide-x divide-y border lg:grid-cols-4 lg:divide-y-0">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 p-6">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <WelcomeModal />
      <div className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Overview
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Dashboard
            </h2>
          </div>
          <Button onClick={() => navigate("/app/campaigns/new")}>
            <Plus className="mr-1.5 h-4 w-4" />
            New campaign
          </Button>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y border lg:grid-cols-4 lg:divide-y-0">
          {statTiles.map((t) => (
            <button
              key={t.label}
              onClick={() => navigate(t.to)}
              className="group p-6 text-left transition-colors hover:bg-muted/40"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {t.label}
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold tabular-nums tracking-tight">
                {t.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t.sub}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="border">
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <h3 className="text-sm font-semibold">Recent campaigns</h3>
              {recentCampaigns.length > 0 && (
                <button
                  onClick={() => navigate("/app/campaigns")}
                  className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all <ArrowUpRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {recentCampaigns.length > 0 ? (
              <div className="divide-y">
                {recentCampaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {campaign.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {campaign.subject}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusDot(campaign.status)}`}
                      />
                      {campaign.status}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-5 py-14 text-center">
                <Send className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium">No campaigns yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first email campaign to get started.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5"
                  onClick={() => navigate("/app/campaigns/new")}
                >
                  Create your first campaign
                </Button>
              </div>
            )}
          </div>

          <div className="border">
            <div className="border-b px-5 py-3.5">
              <h3 className="text-sm font-semibold">Quick actions</h3>
            </div>
            <div className="divide-y">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.to)}
                  className="group flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm transition-colors hover:bg-muted/40"
                >
                  <a.icon
                    className="h-[18px] w-[18px] text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className="flex-1 font-medium">{a.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-colors group-hover:text-foreground" />
                </button>
              ))}
            </div>

            {stats.totalCampaigns === 0 && stats.totalSubscribers === 0 && (
              <div className="border-t bg-muted/30 px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Getting started
                </p>
                <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
                  {[
                    "Import or add subscribers",
                    "Create your first campaign",
                    "Preview and send a test",
                    "Send to your audience",
                  ].map((step, i) => (
                    <li key={step} className="flex items-center gap-2.5">
                      <span className="font-mono text-foreground/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
