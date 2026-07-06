// Web scraping via server /api/scrape proxy (provider key is server-side only).

import type { Lead } from "@/types/lead";
import { scrapeApiRequest } from "./scrape-api";
import {
  contactsToLeads,
  extractContactsFromContent,
  mergeLeadsByEmail,
  normalizeUrl,
  parseMapLinks,
  pickContactPageUrls,
} from "./scrape-extract";

type ScrapePageData = {
  html?: string;
  markdown?: string;
  text?: string;
  links?: string[];
  content?: string;
};

type ScrapeApiBody = {
  success?: boolean;
  error?: string;
  data?: unknown;
  links?: unknown;
  results?: unknown;
  [key: string]: unknown;
};

function scrapeError(data: ScrapeApiBody, fallback: string): string {
  const err = data.error;
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}
async function mapWebsite(url: string): Promise<string[]> {
  const data = await scrapeApiRequest("map", {
    body: {
      url: normalizeUrl(url),
      includeSubdomains: false,
      limit: 50,
    },
  });

  if (data.success === false) {
    throw new Error(scrapeError(data, "Could not map website pages"));
  }

  return parseMapLinks(data);
}

async function scrapePage(url: string): Promise<ScrapePageData> {
  const data = await scrapeApiRequest("scrape", {
    body: {
      url: normalizeUrl(url),
      formats: ["markdown", "html", "links"],
      onlyMainContent: false,
    },
  });

  if (data.success === false || !data.data) {
    throw new Error(scrapeError(data, `Could not scrape ${url}`));
  }

  return data.data as ScrapePageData;
}

/** Scrape a website for contacts; optionally maps contact/about/team pages first. */
export async function scrapeWebsiteForLeads(
  url: string,
  options: {
    depth?: number;
    maxLeads?: number;
    deepScan?: boolean;
  } = {},
): Promise<Lead[]> {
  const { depth = 1, maxLeads = 10, deepScan = false } = options;
  const formatted = normalizeUrl(url);
  const urlsToScrape = [formatted];

  if (depth > 1 || deepScan) {
    try {
      const links = await mapWebsite(formatted);
      urlsToScrape.push(...pickContactPageUrls(formatted, links));
    } catch (err) {
      console.warn("Site map failed, scraping entry URL only:", err);
    }
  }

  const uniqueUrls = [...new Set(urlsToScrape)].slice(0, 6);
  const allLeads: Lead[] = [];
  let lastError: string | null = null;

  for (const pageUrl of uniqueUrls) {
    try {
      const data = await scrapePage(pageUrl);
      const contacts = extractContactsFromContent(
        {
          html: data.html,
          markdown: data.markdown,
          text: data.text,
          links: data.links,
        },
        { prioritizeSections: true },
      );

      allLeads.push(...contactsToLeads(pageUrl, contacts, maxLeads));
      if (allLeads.length >= maxLeads) break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Scrape failed";
      console.warn(`Scrape failed for ${pageUrl}:`, err);
    }
  }

  const merged = mergeLeadsByEmail(allLeads).slice(0, maxLeads);
  if (merged.length === 0 && lastError) {
    throw new Error(lastError);
  }

  return merged;
}

export async function scrapeUrlBatch(
  urls: string[],
  options: Parameters<typeof scrapeWebsiteForLeads>[1] = {},
): Promise<Lead[]> {
  const allLeads: Lead[] = [];
  const batchSize = 3;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((u) =>
        scrapeWebsiteForLeads(u, { ...options, maxLeads: options.maxLeads ?? 5 }),
      ),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        allLeads.push(...result.value);
      }
    }

    if (i + batchSize < urls.length) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  return mergeLeadsByEmail(allLeads);
}

export async function scrapeDomainBatch(domains: string[]): Promise<Lead[]> {
  const urls = domains.map((d) => normalizeUrl(d));
  return scrapeUrlBatch(urls, { maxLeads: 3, deepScan: true });
}

export async function searchAndScrapeLeads(
  query: string,
  options: {
    maxResults?: number;
    location?: string;
    industry?: string;
  } = {},
): Promise<Lead[]> {
  const { maxResults = 10, location, industry } = options;

  let searchQuery = query.trim();
  if (location) searchQuery += ` ${location}`;
  if (industry) searchQuery += ` ${industry}`;

  const searchData = await scrapeApiRequest("search", {
    body: {
      query: searchQuery,
      limit: maxResults,
    },
  });

  if (searchData.success === false) {
    throw new Error(scrapeError(searchData, "Web search failed"));
  }

  const results =
    (searchData.data as { results?: unknown[] } | undefined)?.results ||
    (Array.isArray(searchData.data) ? searchData.data : null) ||
    searchData.results ||
    [];

  if (!Array.isArray(results) || results.length === 0) return [];

  const urls = results
    .map((r: { url?: string; link?: string }) => r.url || r.link)
    .filter(Boolean) as string[];

  if (urls.length === 0) return [];

  return scrapeUrlBatch(urls.slice(0, maxResults), {
    maxLeads: Math.max(2, Math.ceil(maxResults / urls.length)),
    deepScan: false,
  }).then((leads) => leads.slice(0, maxResults));
}
