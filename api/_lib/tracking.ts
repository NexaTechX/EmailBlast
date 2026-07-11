// Appends open-tracking pixel, click-tracked links, and unsubscribe footer.

import { createTrackingToken, createUnsubscribeToken } from "./tokens";

const SKIP_LINK_PREFIXES = [
  "mailto:",
  "tel:",
  "#",
  "javascript:",
  "data:",
];

function rewriteLinks(
  html: string,
  campaignId: string,
  email: string,
  appUrl: string,
): string {
  const base = appUrl.replace(/\/$/, "");
  const enc = encodeURIComponent;
  const token = createTrackingToken(campaignId, email);

  return html.replace(
    /href="(https?:\/\/[^"]+)"/gi,
    (match, url: string) => {
      if (SKIP_LINK_PREFIXES.some((p) => url.toLowerCase().startsWith(p))) {
        return match;
      }
      let isConversion = false;
      try {
        const parsed = new URL(url);
        isConversion =
          parsed.searchParams.get("eb_convert") === "1" ||
          parsed.searchParams.get("convert") === "1";
      } catch {
        isConversion = /[?&](eb_convert|convert)=1/i.test(url);
      }
      const path = isConversion ? "conversion" : "click";
      const trackUrl = `${base}/api/track/${path}?cid=${enc(campaignId)}&e=${enc(email)}&url=${enc(url)}&t=${enc(token)}`;
      return `href="${trackUrl}"`;
    },
  );
}

export function injectTracking(
  html: string,
  campaignId: string | undefined,
  email: string,
  appUrl: string,
  mailingAddress?: string,
): string {
  if (!campaignId || !appUrl) return html;
  const enc = encodeURIComponent;
  const base = appUrl.replace(/\/$/, "");
  const token = createTrackingToken(campaignId, email);
  const unsubToken = createUnsubscribeToken(campaignId, email);

  let tracked = rewriteLinks(html, campaignId, email, appUrl);

  const addressBlock = mailingAddress
    ? `<p style="margin-top:8px;">${mailingAddress.replace(/\n/g, "<br/>")}</p>`
    : "";

  const footer = `
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#6b7280;">
      <p>You're receiving this email because you subscribed to our mailing list.</p>
      ${addressBlock}
      <p><a href="${base}/unsubscribe?email=${enc(email)}&campaign=${enc(campaignId)}&t=${enc(unsubToken)}" style="color:#3b82f6;text-decoration:underline;">Unsubscribe</a> | <a href="${base}/legal/privacy" style="color:#3b82f6;text-decoration:underline;">Privacy Policy</a></p>
    </div>`;

  const pixel = `<img src="${base}/api/track/open?cid=${enc(campaignId)}&e=${enc(email)}&t=${enc(token)}" width="1" height="1" style="display:none" alt="" />`;

  return tracked + footer + pixel;
}

export const APP_URL =
  process.env.APP_URL || process.env.VITE_APP_URL || "";
