import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./_lib/db";
import { verifyUnsubscribeToken } from "./_lib/tokens";

const isProd = process.env.NODE_ENV === "production";

// GET|POST /api/unsubscribe?email=&campaign=&t=
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const email = (req.query.email ?? req.body?.email) as string | undefined;
  const campaign = (req.query.campaign ?? req.body?.campaign) as
    | string
    | undefined;
  const token = (req.query.t ?? req.body?.t) as string | undefined;

  if (!email) {
    return res.status(400).json({ error: "Missing email." });
  }

  if (!campaign) {
    return res.status(400).json({
      error: "Missing campaign parameter. Unsubscribe links must include a campaign id.",
    });
  }

  if (isProd && (!token || !verifyUnsubscribeToken(token, campaign, email))) {
    return res.status(403).json({ error: "Invalid or expired unsubscribe link." });
  }

  if (token && !verifyUnsubscribeToken(token, campaign, email)) {
    return res.status(403).json({ error: "Invalid or expired unsubscribe link." });
  }

  try {
    const already = await sql`
      select id from subscribers
      where lower(email) = lower(${email})
        and user_id = (select user_id from campaigns where id = ${campaign})
        and unsubscribed_at is not null
      limit 1
    `;

    if (already.length > 0) {
      return res.status(200).json({ status: "already", email });
    }

    await sql`update subscribers set unsubscribed_at = now()
              where lower(email) = lower(${email})
                and user_id = (select user_id from campaigns where id = ${campaign})
                and unsubscribed_at is null`;

    try {
      await sql`insert into campaign_analytics (campaign_id, email, event_type)
                values (${campaign}, ${email}, 'unsubscribe')`;
    } catch (err) {
      console.error("unsubscribe analytics error", err);
    }

    return res.status(200).json({ status: "success", email });
  } catch (err) {
    console.error("unsubscribe error", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
