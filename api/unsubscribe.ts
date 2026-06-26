import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./_lib/db";

// GET|POST /api/unsubscribe?email=<email>&campaign=<campaignId>
// Marks the subscriber unsubscribed and logs the event. Unauthenticated (called
// from email links), so it runs via the privileged connection and scopes the
// update to the campaign owner when a campaign id is supplied.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const email = (req.query.email ?? req.body?.email) as string | undefined;
  const campaign = (req.query.campaign ?? req.body?.campaign) as
    | string
    | undefined;

  if (!email) {
    return res.status(400).send("Missing email.");
  }

  try {
    if (campaign) {
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
    } else {
      await sql`update subscribers set unsubscribed_at = now()
                where lower(email) = lower(${email}) and unsubscribed_at is null`;
    }
  } catch (err) {
    console.error("unsubscribe error", err);
    return res.status(500).send("Something went wrong. Please try again.");
  }

  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(
    `<!doctype html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head>
     <body style="font-family:system-ui,sans-serif;text-align:center;padding:48px;color:#111">
       <h1>You're unsubscribed</h1>
       <p>${email} will no longer receive these emails.</p>
     </body></html>`,
  );
}
