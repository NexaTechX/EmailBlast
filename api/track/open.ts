import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "../_lib/db";

// 1x1 transparent GIF.
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

// GET /api/track/open?cid=<campaignId>&e=<email> — records an open event and
// returns a tracking pixel. Unauthenticated; writes via privileged connection.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cid = req.query.cid as string | undefined;
  const email = req.query.e as string | undefined;

  if (cid) {
    try {
      await sql`insert into campaign_analytics (campaign_id, email, event_type)
                values (${cid}, ${email ?? null}, 'open')`;
    } catch (err) {
      console.error("track open error", err);
    }
  }

  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  return res.status(200).send(PIXEL);
}
