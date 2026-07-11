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

/** GET /api/track/conversion?cid=&e=&url=&t= — log conversion then redirect. */
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
    // Strip tracking query flag from destination.
    parsed.searchParams.delete("eb_convert");
    destination = parsed.toString();
  } catch {
    return res.status(400).send("Invalid redirect URL.");
  }

  if (cid && email && tokenValid(token, cid, email)) {
    try {
      const existing = await sql`
        select id from campaign_analytics
        where campaign_id = ${cid}
          and lower(email) = lower(${email})
          and event_type = 'conversion'
          and metadata->>'url' = ${destination}
        limit 1
      `;
      if (existing.length === 0) {
        const meta = JSON.stringify({ url: destination, source: "pixel" });
        await sql`insert into campaign_analytics (campaign_id, email, event_type, metadata)
                  values (${cid}, ${email}, 'conversion', ${meta}::jsonb)`;
      }
    } catch (err) {
      console.error("track conversion error", err);
    }
  }

  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.writeHead(302, { Location: destination });
  return res.end();
}
