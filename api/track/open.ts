import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "../_lib/db";
import { verifyTrackingToken } from "../_lib/tokens";

const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

const isProd = process.env.NODE_ENV === "production";

function tokenValid(
  token: string | undefined,
  cid: string,
  email: string,
): boolean {
  if (!token) return !isProd;
  return verifyTrackingToken(token, cid, email);
}

// GET /api/track/open?cid=&e=&t=
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cid = req.query.cid as string | undefined;
  const email = req.query.e as string | undefined;
  const token = req.query.t as string | undefined;

  if (cid && email && tokenValid(token, cid, email)) {
    try {
      await sql`insert into campaign_analytics (campaign_id, email, event_type)
                values (${cid}, ${email}, 'open')`;
    } catch (err) {
      // Unique partial index prevents double-count; ignore conflicts.
      const msg = err instanceof Error ? err.message : String(err);
      if (!/unique|duplicate/i.test(msg)) {
        console.error("track open error", err);
      }
    }
  }

  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  return res.status(200).send(PIXEL);
}
