// Appends an open-tracking pixel and an unsubscribe/privacy footer to campaign
// HTML. The unsubscribe link points at the server /api/unsubscribe endpoint
// (unauthenticated), not the SPA, so it works without a logged-in session.
export function injectTracking(
  html: string,
  campaignId: string | undefined,
  email: string,
  appUrl: string,
): string {
  if (!campaignId || !appUrl) return html;
  const enc = encodeURIComponent;
  const base = appUrl.replace(/\/$/, "");

  const footer = `
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#6b7280;">
      <p>You're receiving this email because you subscribed to our mailing list.</p>
      <p><a href="${base}/api/unsubscribe?email=${enc(email)}&campaign=${enc(campaignId)}" style="color:#3b82f6;text-decoration:underline;">Unsubscribe</a> | <a href="${base}/legal/privacy" style="color:#3b82f6;text-decoration:underline;">Privacy Policy</a></p>
    </div>`;

  const pixel = `<img src="${base}/api/track/open?cid=${enc(campaignId)}&e=${enc(email)}" width="1" height="1" style="display:none" alt="" />`;

  return html + footer + pixel;
}

export const APP_URL =
  process.env.APP_URL || process.env.VITE_APP_URL || "";
