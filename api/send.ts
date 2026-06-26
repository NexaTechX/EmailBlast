import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { injectTracking, APP_URL } from "./_lib/tracking";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/send — send a campaign to a batch of recipients via Resend, with
// per-recipient open-tracking + unsubscribe footer. Secret RESEND_API_KEY stays
// server-side; the client calls this instead of talking to the email provider.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { campaignId, subject, html, from, recipients } = (req.body ||
    {}) as {
    campaignId?: string;
    subject?: string;
    html?: string;
    from?: string;
    recipients?: string[];
  };

  if (
    !from ||
    !subject ||
    !html ||
    !Array.isArray(recipients) ||
    recipients.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "from, subject, html and recipients[] are required" });
  }

  const messages = recipients.map((email) => ({
    from,
    to: email,
    subject,
    html: injectTracking(html, campaignId, email, APP_URL),
    headers: campaignId ? { "X-Campaign-Id": String(campaignId) } : undefined,
    tags: campaignId
      ? [{ name: "campaign_id", value: String(campaignId) }]
      : undefined,
  }));

  try {
    // Resend accepts up to 100 messages per batch call.
    for (let i = 0; i < messages.length; i += 100) {
      const { error } = await resend.batch.send(messages.slice(i, i + 100));
      if (error) throw error;
    }
    return res.status(200).json({ sent: recipients.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send";
    console.error("send error", err);
    return res.status(500).json({ error: message });
  }
}
