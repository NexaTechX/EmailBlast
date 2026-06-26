import type { Campaign } from "@/types";

// Email sending now goes through our own server functions (Vercel /api), which
// hold the Resend API key — no email-provider secret ships to the browser.
// (File name kept for import stability; it no longer talks to Brevo.)

async function postJson(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Email request failed (${res.status}): ${detail}`);
  }
  return res.json();
}

export function sendCampaign(campaign: Campaign, subscribers: string[]) {
  return postJson("/api/send", {
    campaignId: campaign.id,
    subject: campaign.subject,
    html: campaign.content,
    from: campaign.sender_email,
    recipients: subscribers,
  });
}

export function sendTestEmail(campaign: Campaign, testEmail: string) {
  return postJson("/api/send-test", {
    subject: `[TEST] ${campaign.subject}`,
    html: campaign.content,
    from: campaign.sender_email,
    to: testEmail,
  });
}
