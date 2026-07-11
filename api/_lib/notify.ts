import { Resend } from "resend";
import { sql } from "./db";
import { buildSendIdentity } from "./resend-from";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * If the user has email_notifications enabled, send a short "campaign sent"
 * receipt to notifyEmail (account email or default sender).
 */
export async function maybeNotifyCampaignSent(opts: {
  userId: string;
  notifyEmail: string | null | undefined;
  campaignId: string;
  subject: string;
  sentCount: number;
}): Promise<void> {
  const { userId, notifyEmail, campaignId, subject, sentCount } = opts;
  if (!notifyEmail?.trim() || !process.env.RESEND_API_KEY) return;

  try {
    const prefs = await sql`
      select email_notifications from user_preferences
      where user_id = ${userId}
      limit 1
    `;
    const enabled =
      prefs.length === 0 ||
      (prefs[0] as { email_notifications: boolean | null }).email_notifications !==
        false;
    if (!enabled) return;

    const identity = buildSendIdentity({ senderName: "EmailBlast" });

    await resend.emails.send({
      ...identity,
      to: notifyEmail.trim(),
      subject: `Campaign sent: ${subject}`,
      html: `<p>Your campaign <strong>${subject}</strong> was sent to <strong>${sentCount}</strong> recipient${sentCount === 1 ? "" : "s"}.</p><p style="color:#6b7280;font-size:12px;">Campaign ID: ${campaignId}</p>`,
    });
  } catch (err) {
    console.error("campaign sent notification failed", err);
  }
}
