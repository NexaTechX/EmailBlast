import axios from "axios";
import type { Campaign } from "@/types";

const BREVO_API_URL = "https://api.brevo.com/v3";
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;

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
    const response = await axios.post(
      `${BREVO_API_URL}/smtp/email`,
      {
        sender: { email: from },
        to: [{ email: to }],
        subject,
        htmlContent: trackingEnabled
          ? addTrackingPixel(html, campaignId)
          : html,
        headers: campaignId ? { "X-Campaign-Id": campaignId } : undefined,
        tracking: {
          opens: trackingEnabled,
          clicks: trackingEnabled,
        },
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
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
  const batchSize = 1000; // Brevo's recommended batch size
  const batches = [];

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    batches.push(batch);
  }

  try {
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
    return true;
  } catch (error) {
    console.error("Error sending campaign:", error);
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

export async function createContact(
  email: string,
  attributes: Record<string, any> = {},
) {
  try {
    const response = await axios.post(
      `${BREVO_API_URL}/contacts`,
      {
        email,
        attributes,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}

export async function getContactLists() {
  try {
    const response = await axios.get(`${BREVO_API_URL}/contacts/lists`, {
      headers: {
        "api-key": BREVO_API_KEY,
      },
    });
    return response.data.lists;
  } catch (error) {
    console.error("Error getting contact lists:", error);
    throw error;
  }
}
