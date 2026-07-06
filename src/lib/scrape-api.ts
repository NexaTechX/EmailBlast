// Routes web scrape requests through /api/scrape (API key stays server-side).

import { postJson } from "./api-client";

type ScrapePath = "scrape" | "map" | "search";

type ScrapeApiBody = {
  success?: boolean;
  error?: string;
  data?: unknown;
  links?: unknown;
  [key: string]: unknown;
};

export async function scrapeApiRequest(
  path: ScrapePath,
  options: {
    method?: string;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
  } = {},
): Promise<ScrapeApiBody> {
  return postJson("/api/scrape", {
    path,
    method: options.method ?? "POST",
    query: options.query,
    body: options.body,
  });
}
