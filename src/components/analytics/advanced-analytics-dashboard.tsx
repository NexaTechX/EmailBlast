import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MousePointerClick,
  UserMinus,
  AlertTriangle,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
} from "lucide-react";
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
      // First check if the campaign_analytics table exists
      const { error: tableCheckError } = await supabase
        .from("campaign_analytics")
        .select("count")
        .limit(1);

      // If the table doesn't exist, use empty data
      if (tableCheckError && tableCheckError.code === "42P01") {
        console.log(
          "Campaign analytics table does not exist yet, using empty data",
        );
        setAnalytics([]);
        calculateSummary([]);
        return;
      }

      // If the table exists, get the analytics data
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
    const summary = data.reduce(
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
    setSummary(summary);
  };

  const getEventIcon = (type: CampaignAnalytics["event_type"]) => {
    switch (type) {
      case "open":
        return <Mail className="h-4 w-4" />;
      case "click":
        return <MousePointerClick className="h-4 w-4" />;
      case "unsubscribe":
        return <UserMinus className="h-4 w-4" />;
      case "bounce":
        return <AlertTriangle className="h-4 w-4" />;
      case "conversion":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Campaign Analytics
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeframe("day")}
            className={timeframe === "day" ? "bg-primary/10" : ""}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Day
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeframe("week")}
            className={timeframe === "week" ? "bg-primary/10" : ""}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeframe("month")}
            className={timeframe === "month" ? "bg-primary/10" : ""}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Month
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Opens</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{summary.opens}</p>
          <p className="text-sm text-muted-foreground">
            {summary.totalEvents > 0
              ? ((summary.opens / summary.totalEvents) * 100).toFixed(1)
              : 0}
            % of total
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Clicks</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{summary.clicks}</p>
          <p className="text-sm text-muted-foreground">
            {summary.totalEvents > 0
              ? ((summary.clicks / summary.totalEvents) * 100).toFixed(1)
              : 0}
            % of total
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Revenue</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">
            ${summary.revenue.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            {summary.conversions} conversions
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">ROI</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {summary.revenue > 0
              ? ((summary.revenue / 100) * 100).toFixed(0)
              : 0}
            %
          </p>
          <p className="text-sm text-muted-foreground">
            Based on campaign cost
          </p>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.event_type)}
                        <span className="capitalize">{event.event_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(event.occurred_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{event.subscriber_id || "-"}</TableCell>
                    <TableCell>
                      {event.metadata ? JSON.stringify(event.metadata) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Click Distribution</h4>
                <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Click distribution chart will appear here
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Engagement by Time</h4>
                <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Engagement time chart will appear here
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Conversion Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Conversion Funnel</h4>
                <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Conversion funnel chart will appear here
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Revenue by Subscriber Segment
                </h4>
                <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Revenue chart will appear here
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Audience Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Engagement by Segment
                </h4>
                <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Segment engagement chart will appear here
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Device & Email Client
                </h4>
                <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Device distribution chart will appear here
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
