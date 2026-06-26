import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/send-test — send a single test email (no tracking).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { subject, html, from, to } = (req.body || {}) as {
    subject?: string;
    html?: string;
    from?: string;
    to?: string;
  };

  if (!from || !subject || !html || !to) {
    return res
      .status(400)
      .json({ error: "from, subject, html and to are required" });
  }

  try {
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) throw error;
    return res.status(200).json({ sent: true });
  } catch (err: any) {
    console.error("send-test error", err);
    return res.status(500).json({ error: err?.message || "Failed to send" });
  }
}
