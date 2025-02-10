import sgMail from "@sendgrid/mail";
import { supabase } from "./supabase";
import type { Campaign } from "@/types";

sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY || "");

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from: string;
  campaignId?: string;
  trackingEnabled?: boolean;
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
  campaignId,
  trackingEnabled = true,
}: SendEmailParams) {
  try {
    const msg = {
      to,
      from,
      subject,
      html: trackingEnabled ? addTrackingPixel(html, campaignId) : html,
      trackingSettings: {
        clickTracking: { enable: trackingEnabled },
        openTracking: { enable: trackingEnabled },
      },
      customArgs: campaignId ? { campaign_id: campaignId } : undefined,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

function addTrackingPixel(html: string, campaignId?: string): string {
  if (!campaignId) return html;

  const trackingUrl = `${import.meta.env.VITE_APP_URL}/api/track/open?cid=${campaignId}`;
  const pixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none" />`;
  return html + pixel;
}

export async function sendCampaign(campaign: Campaign, subscribers: string[]) {
  const batchSize = 1000; // SendGrid's recommended batch size
  const batches = [];

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    batches.push(batch);
  }

  try {
    // Update campaign status to sending
    await supabase
      .from("campaigns")
      .update({ status: "sending" })
      .eq("id", campaign.id);

    for (const batch of batches) {
      await Promise.all(
        batch.map((subscriber) =>
          sendEmail({
            to: subscriber,
            subject: campaign.subject,
            html: campaign.content,
            from: campaign.sender_email,
            campaignId: campaign.id,
          }),
        ),
      );
    }

    // Update campaign status to sent
    await supabase
      .from("campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaign.id);

    return true;
  } catch (error) {
    // Update campaign status to failed
    await supabase
      .from("campaigns")
      .update({ status: "failed" })
      .eq("id", campaign.id);

    throw error;
  }
}

export async function sendTestEmail(campaign: Campaign, testEmail: string) {
  return sendEmail({
    to: testEmail,
    subject: `[TEST] ${campaign.subject}`,
    html: campaign.content,
    from: campaign.sender_email,
    trackingEnabled: false,
  });
}
