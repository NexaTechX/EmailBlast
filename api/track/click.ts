import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "../_lib/db";
import { verifyTrackingToken } from "../_lib/tokens";

const isProd = process.env.NODE_ENV === "production";

function tokenValid(
  token: string | undefined,
  cid: string,
  email: string,
): boolean {
  if (!token) return !isProd;
  return verifyTrackingToken(token, cid, email);
}

// GET /api/track/click?cid=&e=&url=&t=
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cid = req.query.cid as string | undefined;
  const email = req.query.e as string | undefined;
  const url = req.query.url as string | undefined;
  const token = req.query.t as string | undefined;

  if (!url) {
    return res.status(400).send("Missing url parameter.");
  }

  let destination: string;
  try {
    destination = decodeURIComponent(url);
    const parsed = new URL(destination);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).send("Invalid redirect URL.");
    }
  } catch {
    return res.status(400).send("Invalid redirect URL.");
  }

  if (cid && email && tokenValid(token, cid, email)) {
    try {
      await sql`insert into campaign_analytics (campaign_id, email, event_type)
                values (${cid}, ${email}, 'click')`;
    } catch (err) {
      console.error("track click error", err);
    }
  }

  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.writeHead(302, { Location: destination });
  return res.end();
}
