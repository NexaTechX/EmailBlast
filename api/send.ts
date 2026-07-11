import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { injectTracking, APP_URL } from "./_lib/tracking";
import { requireAuth, verifyCampaignOwnership } from "./_lib/auth";
import { sql } from "./_lib/db";
import { maybeNotifyCampaignSent } from "./_lib/notify";
import { assertCanSendEmails } from "./_lib/plan-limits";
import { applyMergeTags } from "./_lib/merge-tags";
import { buildSendIdentity } from "./_lib/resend-from";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/send — send a campaign via Resend with server-side recipient resolution.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAuth(req);
  if ("error" in auth) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { campaignId, subjectOverride, variantId, recipients: clientRecipients, updateCampaignStatus = true } = (req.body ||
    {}) as {
    campaignId?: string;
    subjectOverride?: string;
    variantId?: string;
    recipients?: string[];
    updateCampaignStatus?: boolean;
  };

  if (!campaignId) {
    return res.status(400).json({ error: "campaignId is required" });
  }

  const owned = await verifyCampaignOwnership(campaignId, auth.user.id);
  if (!owned) {
    return res.status(403).json({ error: "Campaign not found or access denied" });
  }

  const rows = await sql`
    select c.subject, c.content, c.sender_name, c.sender_email, c.list_id,
           p.mailing_address
    from campaigns c
    left join profiles p on p.id = c.user_id
    where c.id = ${campaignId}
    limit 1
  `;

  if (rows.length === 0) {
    return res.status(404).json({ error: "Campaign not found" });
  }

  const campaign = rows[0] as {
    subject: string;
    content: string;
    sender_name: string | null;
    sender_email: string;
    list_id: string | null;
    mailing_address: string | null;
  };

  if (!campaign.list_id) {
    return res.status(400).json({ error: "Campaign has no subscriber list" });
  }

  if (!campaign.mailing_address?.trim()) {
    return res.status(400).json({
      error:
        "Physical mailing address is required. Add it in Settings before sending.",
    });
  }

  const subs = await sql`
    select email, first_name, last_name from subscribers
    where list_id = ${campaign.list_id}
      and user_id = ${auth.user.id}
      and unsubscribed_at is null
  `;

  const subRows = subs as Array<{
    email: string;
    first_name: string | null;
    last_name: string | null;
  }>;
  const recipients = subRows.map((s) => s.email);
  if (recipients.length === 0) {
    return res.status(400).json({ error: "No active subscribers in the selected list" });
  }

  let targetRecipients = recipients;
  if (Array.isArray(clientRecipients) && clientRecipients.length > 0) {
    const allowed = new Set(recipients.map((e) => e.toLowerCase()));
    const subset = clientRecipients.filter((e) => allowed.has(e.toLowerCase()));
    if (subset.length === 0) {
      return res.status(400).json({ error: "No valid recipients in subset" });
    }
    targetRecipients = subset;
  }

  const subByEmail = new Map(
    subRows.map((s) => [s.email.toLowerCase(), s] as const),
  );

  try {
    await assertCanSendEmails(auth.user.id, targetRecipients.length);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send limit exceeded";
    return res.status(403).json({ error: message });
  }

  const identity = buildSendIdentity({
    senderName: campaign.sender_name,
    replyToEmail: campaign.sender_email,
  });
  const subject = subjectOverride?.trim() || campaign.subject;
  const html = campaign.content;
  const mailingAddress = campaign.mailing_address.trim();

  const messages = targetRecipients.map((email) => {
    const sub = subByEmail.get(email.toLowerCase());
    const personalized = applyMergeTags(html, {
      email,
      first_name: sub?.first_name,
      last_name: sub?.last_name,
    });
    return {
      ...identity,
      to: email,
      subject,
      html: injectTracking(
        personalized,
        campaignId,
        email,
        APP_URL,
        mailingAddress,
      ),
      headers: { "X-Campaign-Id": String(campaignId) },
      tags: [
        { name: "campaign_id", value: String(campaignId) },
        ...(variantId ? [{ name: "variant_id", value: String(variantId) }] : []),
      ],
    };
  });

  let sentCount = 0;
  let hadError = false;
  let lastError = "";

  try {
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      const { error } = await resend.batch.send(batch);
      if (error) {
        hadError = true;
        lastError = error.message || "Resend batch error";
        break;
      }

      for (const msg of batch) {
        const to = Array.isArray(msg.to) ? msg.to[0] : msg.to;
        sentCount++;
        try {
          await sql`
            insert into campaign_analytics (campaign_id, email, event_type, metadata)
            values (${campaignId}, ${to ?? null}, 'sent', ${variantId ? JSON.stringify({ variant_id: variantId }) : null}::jsonb)
          `;
        } catch (err) {
          console.error("sent analytics error", err);
        }
      }
    }

    if (hadError || sentCount === 0) {
      if (updateCampaignStatus) {
        await sql`update campaigns set status = 'failed', updated_at = now() where id = ${campaignId}`;
      }
      return res.status(500).json({
        error: lastError || "Failed to send campaign",
        sent: sentCount,
      });
    }

    if (sentCount < targetRecipients.length) {
      if (updateCampaignStatus) {
        await sql`
          update campaigns set status = 'failed', sent_at = now(), updated_at = now()
          where id = ${campaignId}
        `;
      }
      return res.status(207).json({
        sent: sentCount,
        total: targetRecipients.length,
        partial: true,
      });
    }

    if (updateCampaignStatus) {
      await sql`
        update campaigns set status = 'sent', sent_at = now(), updated_at = now()
        where id = ${campaignId}
      `;
    }

    await maybeNotifyCampaignSent({
      userId: auth.user.id,
      notifyEmail: auth.user.email,
      campaignId,
      subject,
      sentCount,
    });

    return res.status(200).json({ sent: sentCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send";
    console.error("send error", err);
    if (updateCampaignStatus) {
      try {
        await sql`update campaigns set status = 'failed', updated_at = now() where id = ${campaignId}`;
      } catch {
        /* ignore */
      }
    }
    return res.status(500).json({ error: message, sent: sentCount });
  }
}
