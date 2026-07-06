import { useParams } from "react-router-dom";
import { AdvancedAnalyticsDashboard } from "@/components/analytics/advanced-analytics-dashboard";

export function CampaignAnalyticsRoute() {
  const { id } = useParams();
  return <AdvancedAnalyticsDashboard campaignId={id || "overview"} />;
}
