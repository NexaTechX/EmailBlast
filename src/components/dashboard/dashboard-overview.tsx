import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, BarChart, ArrowRight, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import type { Campaign } from "@/types";

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSubscribers: number;
  activeSubscribers: number;
  averageOpenRate: number;
  averageClickRate: number;
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
  });
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (campaignsError) throw campaignsError;

      // Fetch subscribers
      const { data: subscribers, error: subscribersError } = await supabase
        .from("subscribers")
        .select("unsubscribed_at");

      if (subscribersError) throw subscribersError;

      // Fetch analytics for calculating open rate
      const { data: analytics, error: analyticsError } = await supabase
        .from("campaign_analytics")
        .select("event_type, campaign_id");

      // Count sent campaigns for open rate calculation
      const sentCampaigns = campaigns?.filter((c) => c.status === "sent") || [];
      
      // Calculate open rate
      let totalOpens = 0;
      let totalClicks = 0;
      if (analytics) {
        totalOpens = analytics.filter((a) => a.event_type === "open").length;
        totalClicks = analytics.filter((a) => a.event_type === "click").length;
      }

      const activeSubscribers = subscribers?.filter((s) => !s.unsubscribed_at) || [];
      const openRate = sentCampaigns.length > 0 && activeSubscribers.length > 0
        ? (totalOpens / (sentCampaigns.length * activeSubscribers.length)) * 100
        : 0;
      
      const clickRate = totalOpens > 0
        ? (totalClicks / totalOpens) * 100
        : 0;

      setStats({
        totalCampaigns: campaigns?.length || 0,
        activeCampaigns: campaigns?.filter((c) => c.status === "scheduled" || c.status === "sending").length || 0,
        totalSubscribers: subscribers?.length || 0,
        activeSubscribers: activeSubscribers.length,
        averageOpenRate: Math.round(openRate * 10) / 10,
        averageClickRate: Math.round(clickRate * 10) / 10,
      });

      setRecentCampaigns((campaigns || []) as Campaign[]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "sending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <WelcomeModal />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Button onClick={() => navigate("/app/campaigns/new")}>
            <Mail className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-background border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Campaigns</h3>
            </div>
            {stats.activeCampaigns > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {stats.activeCampaigns} active
              </Badge>
            )}
          </div>
          <p className="mt-4 text-4xl font-bold">{stats.totalCampaigns}</p>
          <p className="text-sm text-muted-foreground">Total campaigns</p>
          <Button
            variant="link"
            className="mt-4 p-0 text-primary hover:text-primary/80"
            onClick={() => navigate("/app/campaigns")}
          >
            View all campaigns <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        <Card className="p-6 bg-background border border-border">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Subscribers</h3>
          </div>
          <p className="mt-4 text-4xl font-bold">{stats.activeSubscribers}</p>
          <p className="text-sm text-muted-foreground">
            Active subscribers
            {stats.totalSubscribers !== stats.activeSubscribers && (
              <span className="ml-1">
                ({stats.totalSubscribers - stats.activeSubscribers} unsubscribed)
              </span>
            )}
          </p>
          <Button
            variant="link"
            className="mt-4 p-0 text-primary hover:text-primary/80"
            onClick={() => navigate("/app/subscribers")}
          >
            Manage subscribers <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        <Card className="p-6 bg-background border border-border">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Performance</h3>
          </div>
          <p className="mt-4 text-4xl font-bold">{stats.averageOpenRate}%</p>
          <p className="text-sm text-muted-foreground">
            Average open rate
            {stats.averageClickRate > 0 && (
              <span className="ml-1">• {stats.averageClickRate}% CTR</span>
            )}
          </p>
          <Button
            variant="link"
            className="mt-4 p-0 text-primary hover:text-primary/80"
            onClick={() => navigate("/app/analytics")}
          >
            View analytics <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-background border border-border">
          <h3 className="font-semibold mb-4">Recent Campaigns</h3>
          {recentCampaigns.length > 0 ? (
            <div className="space-y-3">
              {recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{campaign.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {campaign.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => navigate("/app/campaigns")}
              >
                View all campaigns
              </Button>
            </div>
          ) : (
            <div>
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">No campaigns yet</p>
                <p className="text-sm">Create your first email campaign to get started</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/app/campaigns/new")}
              >
                Create your first campaign
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-background border border-border">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/app/campaigns/new")}
            >
              <Mail className="mr-2 h-4 w-4" />
              Create New Campaign
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/app/subscribers")}
            >
              <Users className="mr-2 h-4 w-4" />
              Import Subscribers
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/app/analytics")}
            >
              <BarChart className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/app/lead-finder")}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Find New Leads
            </Button>
          </div>
          
          {stats.totalCampaigns === 0 && stats.totalSubscribers === 0 && (
            <div className="mt-6 p-4 border rounded-lg bg-primary/5">
              <h4 className="font-medium mb-2 text-sm">Getting Started</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
                <li>Import or add subscribers</li>
                <li>Create your first campaign</li>
                <li>Preview and test your email</li>
                <li>Send to your audience</li>
              </ol>
            </div>
          )}
        </Card>
      </div>
      </div>
    </>
  );
}
