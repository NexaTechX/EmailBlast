// Supabase Edge Function to handle email tracking events
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get("cid");
    const email = url.searchParams.get("email");
    const eventType = url.searchParams.get("type") || "open"; // open, click, etc.

    if (!campaignId) {
      return new Response("Missing campaign ID", { status: 400 });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get subscriber info if email provided
    let subscriberId = null;
    if (email) {
      const { data: subscriber } = await supabaseClient
        .from("subscribers")
        .select("id")
        .eq("email", email)
        .single();
      
      subscriberId = subscriber?.id;
    }

    // Record the event
    await supabaseClient.from("campaign_analytics").insert({
      campaign_id: campaignId,
      subscriber_id: subscriberId,
      email: email,
      event_type: eventType,
      occurred_at: new Date().toISOString(),
      device_info: {
        user_agent: req.headers.get("user-agent"),
      },
    });

    // Return a 1x1 transparent pixel for open tracking
    if (eventType === "open") {
      const pixel = new Uint8Array([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
        0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
        0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
      ]);

      return new Response(pixel, {
        headers: {
          ...corsHeaders,
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      });
    }

    // For click tracking, redirect to the target URL
    const targetUrl = url.searchParams.get("url");
    if (eventType === "click" && targetUrl) {
      return Response.redirect(targetUrl, 302);
    }

    return new Response("Event tracked", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error tracking event:", error);
    return new Response("Error tracking event", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});

