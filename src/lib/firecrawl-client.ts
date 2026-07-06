// Routes Firecrawl calls through our server proxy (/api/scrape) so the Firecrawl
// API key never ships to the browser. Returns the raw fetch Response from the
// proxy (which mirrors Firecrawl's status + JSON), so existing call sites that
// check `response.ok` and call `response.json()` keep working unchanged.
type FirecrawlInit = {
  method?: string;
  query?: Record<string, unknown>;
  body?: string;
};

import { authHeaders } from "./api-client";

/** Route a Firecrawl request through the server proxy (/api/scrape). */
export async function firecrawlFetch(
  path: "scrape" | "map" | "search",
  init: FirecrawlInit = {},
): Promise<Response> {
  const headers = await authHeaders();
  return fetch("/api/scrape", {
    method: "POST",
    headers,
    body: JSON.stringify({
      path,
      method: init.method ?? "POST",
      query: init.query,
      body: init.body ? JSON.parse(init.body) : undefined,
    }),
  });
}
