import { supabase } from "./supabase";
import type { CampaignAnalytics } from "@/types";

export async function handleSendGridWebhook(event: any) {
  const eventMapping: Record<string, CampaignAnalytics["event_type"]> = {
    open: "open",
    click: "click",
    bounce: "bounce",
    unsubscribe: "unsubscribe",
  };

  const eventType = eventMapping[event.event];
  if (!eventType) return;

  await supabase.from("campaign_analytics").insert({
    campaign_id: event.campaign_id,
    event_type: eventType,
    subscriber_id: event.subscriber_id,
    metadata: event,
  });

  if (eventType === "unsubscribe") {
    await supabase.rpc("handle_unsubscribe", {
      p_email: event.email,
      p_list_id: event.list_id,
    });
  }
}
