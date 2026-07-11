import type { Campaign } from "@/types";
import { postJson } from "./api-client";

/** Send a campaign via the server-side Resend proxy (/api/send). */
export function sendCampaign(
  campaign: Campaign,
  options?: {
    recipients?: string[];
    subjectOverride?: string;
    variantId?: string;
    updateCampaignStatus?: boolean;
  },
) {
  return postJson("/api/send", {
    campaignId: campaign.id,
    ...options,
  });
}

/** Send a one-off test email via /api/send-test. */
export function sendTestEmail(campaign: Campaign, testEmail: string) {
  return postJson("/api/send-test", {
    subject: `[TEST] ${campaign.subject}`,
    html: campaign.content,
    senderName: campaign.sender_name,
    replyTo: campaign.sender_email,
    to: testEmail,
  });
}
