import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "../_lib/db";

// POST /api/webhooks/resend — Resend event webhook. Records delivery events
// (bounce/complaint/click; opens also arrive but are already tracked by the
// pixel). Captures bounces/complaints the pixel can't.
//
// NOTE: configure Resend to call this URL. For production, verify the Svix
// signature using RESEND_WEBHOOK_SECRET; left as a follow-up to avoid adding the
// svix dependency before the rest of the flow is wired.

const EVENT_MAP: Record<string, string> = {
  "email.opened": "open",
  "email.clicked": "click",
  "email.bounced": "bounce",
  "email.complained": "unsubscribe",
};

function extractCampaignId(data: any): string | undefined {
  const tags = data?.tags;
  if (!tags) return undefined;
  if (Array.isArray(tags)) {
    return tags.find((t: any) => t?.name === "campaign_id")?.value;
  }
  if (typeof tags === "object") return tags.campaign_id;
  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const event = req.body || {};
  const eventType = EVENT_MAP[event.type as string];
  if (!eventType) return res.status(200).json({ ignored: true });

  const data = event.data || {};
  const email = Array.isArray(data.to) ? data.to[0] : data.to;
  const campaignId = extractCampaignId(data);

  if (!campaignId) return res.status(200).json({ ignored: "no campaign_id" });

  try {
    await sql`insert into campaign_analytics (campaign_id, email, event_type, metadata)
              values (${campaignId}, ${email ?? null}, ${eventType}, ${JSON.stringify(event)}::jsonb)`;

    if (eventType === "unsubscribe" && email) {
      await sql`update subscribers set unsubscribed_at = now()
                where lower(email) = lower(${email})
                  and user_id = (select user_id from campaigns where id = ${campaignId})
                  and unsubscribed_at is null`;
    }
  } catch (err) {
    console.error("resend webhook error", err);
    return res.status(500).json({ error: "Failed to record event" });
  }

  return res.status(200).json({ ok: true });
}
