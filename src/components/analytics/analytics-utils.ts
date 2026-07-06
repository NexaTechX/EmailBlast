import { supabase } from "@/lib/supabase";

export async function getCampaignAnalytics(
  campaignId: string,
  timeframe?: "day" | "week" | "month",
) {
  const since = timeframe ? getSinceDate(timeframe) : null;

  try {
    let query = supabase
      .from("campaign_analytics")
      .select("*")
      .order("occurred_at", { ascending: false });

    if (campaignId !== "overview") {
      query = query.eq("campaign_id", campaignId);
    }

    if (since) {
      query = query.gte("occurred_at", since.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error in getCampaignAnalytics:", error);
    throw error;
  }
}

function getSinceDate(timeframe: "day" | "week" | "month"): Date {
  const d = new Date();
  if (timeframe === "day") d.setDate(d.getDate() - 1);
  else if (timeframe === "week") d.setDate(d.getDate() - 7);
  else d.setMonth(d.getMonth() - 1);
  return d;
}
