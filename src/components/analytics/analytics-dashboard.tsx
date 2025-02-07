import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { getCampaignAnalytics } from "@/lib/api";
import type { CampaignAnalytics } from "@/types";

interface AnalyticsSummary {
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
  totalEvents: number;
}

export function AnalyticsDashboard({ campaignId }: { campaignId: string }) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    opens: 0,
    clicks: 0,
    unsubscribes: 0,
    bounces: 0,
    totalEvents: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, [campaignId]);

  const loadAnalytics = async () => {
    try {
      const data = await getCampaignAnalytics(campaignId);
      setAnalytics(data);
      calculateSummary(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
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
        }
        return acc;
      },
      { opens: 0, clicks: 0, unsubscribes: 0, bounces: 0, totalEvents: 0 },
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
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Campaign Analytics</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Opens</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{summary.opens}</p>
          <p className="text-sm text-muted-foreground">
            {((summary.opens / summary.totalEvents) * 100).toFixed(1)}% of total
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Clicks</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{summary.clicks}</p>
          <p className="text-sm text-muted-foreground">
            {((summary.clicks / summary.totalEvents) * 100).toFixed(1)}% of
            total
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Unsubscribes</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{summary.unsubscribes}</p>
          <p className="text-sm text-muted-foreground">
            {((summary.unsubscribes / summary.totalEvents) * 100).toFixed(1)}%
            of total
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold">Bounces</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{summary.bounces}</p>
          <p className="text-sm text-muted-foreground">
            {((summary.bounces / summary.totalEvents) * 100).toFixed(1)}% of
            total
          </p>
        </Card>
      </div>

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
    </div>
  );
}
