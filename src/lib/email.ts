import type { Campaign } from "@/types";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from: string;
  trackingEnabled?: boolean;
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
  trackingEnabled = true,
}: SendEmailParams) {
  // TODO: Replace with actual SendGrid API key
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: { email: from },
      content: [
        {
          type: "text/html",
          value: trackingEnabled ? addTrackingPixel(html) : html,
        },
      ],
      tracking_settings: {
        click_tracking: { enable: trackingEnabled },
        open_tracking: { enable: trackingEnabled },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send email");
  }

  return response.json();
}

function addTrackingPixel(html: string): string {
  const pixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/track/open" width="1" height="1" />`;
  return html + pixel;
}

export async function sendCampaign(campaign: Campaign, subscribers: string[]) {
  const batchSize = 1000; // SendGrid's recommended batch size
  const batches = [];

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    batches.push(batch);
  }

  for (const batch of batches) {
    await Promise.all(
      batch.map((subscriber) =>
        sendEmail({
          to: subscriber,
          subject: campaign.subject,
          html: campaign.content,
          from: campaign.sender_email,
        }),
      ),
    );
  }
}
