import type { VercelRequest, VercelResponse } from "@vercel/node";

// POST /api/scrape — proxies allow-listed Firecrawl endpoints with the
// FIRECRAWL_API_KEY held server-side (replaces the old client-side key).
// Body: { path: "scrape"|"map"|"search", method?, query?, body? }.
// Returns Firecrawl's upstream status + JSON unchanged.
const BASE = "https://api.firecrawl.dev/v1";
const ALLOWED = new Set(["scrape", "map", "search"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    path,
    method = "POST",
    query,
    body,
  } = (req.body || {}) as {
    path?: string;
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  };

  if (!path || !ALLOWED.has(path)) {
    return res.status(400).json({ error: `Unsupported scrape path: ${path}` });
  }

  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "FIRECRAWL_API_KEY not configured" });
  }

  let url = `${BASE}/${path}`;
  if (query && typeof query === "object") {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) sp.append(k, String(v));
    }
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }

  try {
    const upstream = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: method === "GET" ? undefined : JSON.stringify(body ?? {}),
    });
    const data = await upstream.json().catch(() => ({}));
    return res.status(upstream.status).json(data);
  } catch (err: any) {
    console.error("scrape proxy error", err);
    return res.status(502).json({ error: err?.message || "Scrape proxy failed" });
  }
}
