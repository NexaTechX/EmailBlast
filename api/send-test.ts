import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { requireAuth } from "./_lib/auth";
import { buildSendIdentity } from "./_lib/resend-from";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/send-test — send a single test email (no tracking).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAuth(req);
  if ("error" in auth) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { subject, html, to, senderName, replyTo } = (req.body || {}) as {
    subject?: string;
    html?: string;
    to?: string;
    senderName?: string;
    replyTo?: string;
    /** @deprecated ignored — platform owns From */
    from?: string;
  };

  if (!subject || !html || !to) {
    return res
      .status(400)
      .json({ error: "subject, html and to are required" });
  }

  try {
    const identity = buildSendIdentity({
      senderName: senderName || "EmailBlast",
      replyToEmail: replyTo,
    });
    const { error } = await resend.emails.send({
      ...identity,
      to,
      subject,
      html,
    });
    if (error) throw error;
    return res.status(200).json({ sent: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send";
    console.error("send-test error", err);
    return res.status(500).json({ error: message });
  }
}
