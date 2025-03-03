import { supabase } from "@/lib/supabase";

// Function to fetch campaign analytics data
export async function getCampaignAnalytics(campaignId: string) {
  try {
    // Handle the overview case differently
    if (campaignId === "overview") {
      const { data, error } = await supabase
        .from("campaign_analytics")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    }

    // Regular campaign analytics fetch
    const { data, error } = await supabase
      .from("campaign_analytics")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("occurred_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error in getCampaignAnalytics:", error);
    throw error;
  }
}

// Function to insert analytics event
export async function trackEvent(
  campaignId: string,
  eventType: string,
  subscriberId?: string,
  metadata?: any,
) {
  try {
    const { data, error } = await supabase.from("campaign_analytics").insert([
      {
        campaign_id: campaignId,
        event_type: eventType,
        subscriber_id: subscriberId,
        metadata: metadata,
      },
    ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error tracking event:", error);
    throw error;
  }
}

// Function to get analytics summary
export async function getAnalyticsSummary(campaignId: string) {
  try {
    // If overview, get summary across all campaigns
    if (campaignId === "overview") {
      const { data, error } = await supabase
        .from("campaign_analytics")
        .select("event_type, count")
        .order("occurred_at", { ascending: false });

      if (error) throw error;
      return summarizeAnalytics(data || []);
    }

    // Get summary for specific campaign
    const { data, error } = await supabase
      .from("campaign_analytics")
      .select("event_type, metadata")
      .eq("campaign_id", campaignId);

    if (error) throw error;
    return summarizeAnalytics(data || []);
  } catch (error) {
    console.error("Error getting analytics summary:", error);
    throw error;
  }
}

// Helper function to summarize analytics data
function summarizeAnalytics(data: any[]) {
  const summary = {
    opens: 0,
    clicks: 0,
    unsubscribes: 0,
    bounces: 0,
    conversions: 0,
    revenue: 0,
    totalEvents: data.length,
  };

  data.forEach((event) => {
    switch (event.event_type) {
      case "open":
        summary.opens++;
        break;
      case "click":
        summary.clicks++;
        break;
      case "unsubscribe":
        summary.unsubscribes++;
        break;
      case "bounce":
        summary.bounces++;
        break;
      case "conversion":
        summary.conversions++;
        if (event.metadata?.revenue) {
          summary.revenue += Number(event.metadata.revenue);
        }
        break;
    }
  });

  return summary;
}
