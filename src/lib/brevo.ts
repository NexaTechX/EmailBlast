import type { Campaign } from "@/types";
import { postJson } from "./api-client";

// Email sending goes through Vercel /api routes (Resend server-side).

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

export function sendTestEmail(campaign: Campaign, testEmail: string) {
  return postJson("/api/send-test", {
    subject: `[TEST] ${campaign.subject}`,
    html: campaign.content,
    from: campaign.sender_email,
    to: testEmail,
  });
}
