import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Serves.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const events = await req.json();

    for (const event of events) {
      const campaignId = event?.campaign_id;
      if (!campaignId) continue;

      const eventType = event.event;
      const email = event.email;
      const timestamp = new Date(event.timestamp * 1000).toISOString();

      // Map SendGrid event types to our analytics event types
      const eventMapping: Record<string, string> = {
        open: "open",
        click: "click",
        bounce: "bounce",
        unsubscribe: "unsubscribe",
        dropped: "bounce",
        spamreport: "unsubscribe",
      };

      const mappedEventType = eventMapping[eventType];
      if (!mappedEventType) continue;

      // Record the event
      await supabase.from("campaign_analytics").insert({
        campaign_id: campaignId,
        event_type: mappedEventType,
        email,
        occurred_at: timestamp,
        metadata: event,
      });

      // Handle unsubscribes
      if (mappedEventType === "unsubscribe") {
        await supabase.rpc("handle_unsubscribe", {
          p_email: email,
          p_campaign_id: campaignId,
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
