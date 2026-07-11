import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { sql } from "../_lib/db";
import { injectTracking, APP_URL } from "../_lib/tracking";
import { maybeNotifyCampaignSent } from "../_lib/notify";
import {
  assertCanSendEmails,
  FREE_MONTHLY_EMAIL_LIMIT,
} from "../_lib/plan-limits";
import { applyMergeTags } from "../_lib/merge-tags";
import { buildSendIdentity } from "../_lib/resend-from";

const resend = new Resend(process.env.RESEND_API_KEY);
const isProd = process.env.NODE_ENV === "production";

// GET /api/cron/send-scheduled — process due scheduled campaigns (Vercel Cron).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (isProd && !cronSecret) {
    return res.status(500).json({ error: "CRON_SECRET must be set in production" });
  }
  if (cronSecret) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "RESEND_API_KEY not configured" });
  }

  try {
    const due = await sql`
      select c.id, c.user_id, c.subject, c.content, c.sender_name, c.sender_email, c.list_id,
             p.mailing_address, p.default_sender_email
      from campaigns c
      left join profiles p on p.id = c.user_id
      where c.status = 'scheduled'
        and c.scheduled_for <= now()
      limit 10
    `;

    let processed = 0;

    for (const campaign of due as Array<{
      id: string;
      user_id: string;
      subject: string;
      content: string;
      sender_name: string | null;
      sender_email: string;
      list_id: string | null;
      mailing_address: string | null;
      default_sender_email: string | null;
    }>) {
      if (!campaign.list_id) {
        await sql`update campaigns set status = 'failed' where id = ${campaign.id}`;
        continue;
      }

      if (!campaign.mailing_address?.trim()) {
        await sql`update campaigns set status = 'failed' where id = ${campaign.id}`;
        continue;
      }

      // Atomically claim the campaign so overlapping cron runs can't both
      // send it; skip if another invocation already picked it up.
      const claimed = await sql`
        update campaigns set status = 'sending'
        where id = ${campaign.id} and status = 'scheduled'
        returning id
      `;
      if (claimed.length === 0) {
        continue;
      }

      const subs = await sql`
        select email, first_name, last_name from subscribers
        where list_id = ${campaign.list_id}
          and unsubscribed_at is null
      `;

      const subRows = subs as Array<{
        email: string;
        first_name: string | null;
        last_name: string | null;
      }>;
      const recipients = subRows.map((s) => s.email);
      if (recipients.length === 0) {
        await sql`update campaigns set status = 'failed' where id = ${campaign.id}`;
        continue;
      }

      try {
        await assertCanSendEmails(campaign.user_id, recipients.length);
      } catch (err) {
        console.error(
          `cron skip ${campaign.id}: monthly limit (${FREE_MONTHLY_EMAIL_LIMIT})`,
          err,
        );
        await sql`update campaigns set status = 'failed' where id = ${campaign.id}`;
        continue;
      }

      const identity = buildSendIdentity({
        senderName: campaign.sender_name,
        replyToEmail: campaign.sender_email,
      });
      const mailingAddress = campaign.mailing_address.trim();
      const subByEmail = new Map(
        subRows.map((s) => [s.email.toLowerCase(), s] as const),
      );

      const messages = recipients.map((email) => {
        const sub = subByEmail.get(email.toLowerCase());
        const personalized = applyMergeTags(campaign.content, {
          email,
          first_name: sub?.first_name,
          last_name: sub?.last_name,
        });
        return {
          ...identity,
          to: email,
          subject: campaign.subject,
          html: injectTracking(
            personalized,
            campaign.id,
            email,
            APP_URL,
            mailingAddress,
          ),
          tags: [{ name: "campaign_id", value: campaign.id }],
        };
      });

      let sentCount = 0;
      let batchFailed = false;

      for (let i = 0; i < messages.length; i += 100) {
        const batch = messages.slice(i, i + 100);
        const { error } = await resend.batch.send(batch);
        if (error) {
          batchFailed = true;
          console.error("cron batch error", error);
          break;
        }

        for (const msg of batch) {
          const to = Array.isArray(msg.to) ? msg.to[0] : msg.to;
          sentCount++;
          try {
            await sql`
              insert into campaign_analytics (campaign_id, email, event_type)
              values (${campaign.id}, ${to ?? null}, 'sent')
            `;
          } catch (err) {
            console.error("sent analytics error", err);
          }
        }
      }

      if (batchFailed || sentCount === 0) {
        await sql`update campaigns set status = 'failed' where id = ${campaign.id}`;
        continue;
      }

      if (sentCount < recipients.length) {
        await sql`
          update campaigns set status = 'failed', sent_at = now()
          where id = ${campaign.id}
        `;
        continue;
      }

      await sql`
        update campaigns
        set status = 'sent', sent_at = now()
        where id = ${campaign.id}
      `;
      await maybeNotifyCampaignSent({
        userId: campaign.user_id,
        notifyEmail:
          campaign.default_sender_email || campaign.sender_email,
        campaignId: campaign.id,
        subject: campaign.subject,
        sentCount,
      });
      processed++;
    }

    return res.status(200).json({ processed, due: due.length });
  } catch (err) {
    console.error("cron send-scheduled error", err);
    const message = err instanceof Error ? err.message : "Cron failed";
    return res.status(500).json({ error: message });
  }
}
