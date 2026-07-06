import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Webhook } from "svix";
import { sql } from "../_lib/db";

const EVENT_MAP: Record<string, string> = {
  "email.opened": "open",
  "email.clicked": "click",
  "email.bounced": "bounce",
  "email.complained": "unsubscribe",
};

type Tag = { name?: string; value?: string };

function extractCampaignId(
  data: Record<string, unknown> | undefined,
): string | undefined {
  const tags = data?.tags;
  if (!tags) return undefined;
  if (Array.isArray(tags)) {
    return (tags as Tag[]).find((t) => t?.name === "campaign_id")?.value;
  }
  if (typeof tags === "object") {
    return (tags as { campaign_id?: string }).campaign_id;
  }
  return undefined;
}

function extractVariantId(
  data: Record<string, unknown> | undefined,
): string | undefined {
  const tags = data?.tags;
  if (!tags) return undefined;
  if (Array.isArray(tags)) {
    return (tags as Tag[]).find((t) => t?.name === "variant_id")?.value;
  }
  if (typeof tags === "object") {
    return (tags as { variant_id?: string }).variant_id;
  }
  return undefined;
}

/** POST /api/webhooks/resend — record provider delivery events into analytics. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && !secret) {
    return res.status(500).json({ error: "RESEND_WEBHOOK_SECRET must be set in production" });
  }

  let event: Record<string, unknown> = req.body || {};

  if (secret) {
    const wh = new Webhook(secret);
    const svixId = req.headers["svix-id"] as string;
    const svixTimestamp = req.headers["svix-timestamp"] as string;
    const svixSignature = req.headers["svix-signature"] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(401).json({ error: "Missing webhook signature headers" });
    }

    try {
      event = wh.verify(JSON.stringify(req.body), {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as Record<string, unknown>;
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(401).json({ error: "Invalid webhook signature" });
    }
  }

  const eventType = EVENT_MAP[event.type as string];
  if (!eventType) return res.status(200).json({ ignored: true });

  const data = (event.data || {}) as Record<string, unknown>;
  const email = Array.isArray(data.to) ? data.to[0] : data.to;
  const campaignId = extractCampaignId(data);
  const variantId = extractVariantId(data);

  if (!campaignId) return res.status(200).json({ ignored: "no campaign_id" });

  const metadata = variantId
    ? JSON.stringify({ ...event, variant_id: variantId })
    : JSON.stringify(event);

  try {
    if (eventType === "open" && email) {
      const existing = await sql`
        select id from campaign_analytics
        where campaign_id = ${campaignId}
          and lower(email) = lower(${email as string})
          and event_type = 'open'
        limit 1
      `;
      if (existing.length > 0) {
        return res.status(200).json({ ok: true, deduped: true });
      }
    }

    await sql`insert into campaign_analytics (campaign_id, email, event_type, metadata)
              values (${campaignId}, ${email ?? null}, ${eventType}, ${metadata}::jsonb)`;

    if (eventType === "unsubscribe" && email) {
      await sql`update subscribers set unsubscribed_at = now()
                where lower(email) = lower(${email as string})
                  and user_id = (select user_id from campaigns where id = ${campaignId})
                  and unsubscribed_at is null`;
    }

    if (eventType === "bounce" && email) {
      await sql`update subscribers set unsubscribed_at = now()
                where lower(email) = lower(${email as string})
                  and user_id = (select user_id from campaigns where id = ${campaignId})
                  and unsubscribed_at is null`;
    }
  } catch (err) {
    console.error("resend webhook error", err);
    return res.status(500).json({ error: "Failed to record event" });
  }

  return res.status(200).json({ ok: true });
}
