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
import { Plus, Mail, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCampaigns } from "@/lib/api";
import type { Campaign } from "@/types";

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    }
  };

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "sent":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
        <Button onClick={() => navigate("/app/campaigns/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      </div>

      {/* Desktop table view */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.title}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status.charAt(0).toUpperCase() +
                      campaign.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  {campaign.sent_at
                    ? new Date(campaign.sent_at).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/app/campaigns/${campaign.id}/analytics`)
                      }
                    >
                      <BarChart className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {campaigns.map((campaign) => (
          <Card
            key={campaign.id}
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{campaign.title}</h3>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {campaign.subject}
                </p>
              </div>
              <Badge className={getStatusColor(campaign.status) + " ml-2 flex-shrink-0"}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
            {campaign.sent_at && (
              <p className="text-xs text-muted-foreground mb-3">
                Sent: {new Date(campaign.sent_at).toLocaleDateString()}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/app/campaigns/${campaign.id}`);
                }}
              >
                <Mail className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/app/campaigns/${campaign.id}/analytics`);
                }}
              >
                <BarChart className="h-4 w-4 mr-1" />
                Analytics
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
