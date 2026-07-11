// Web scraping via server /api/scrape proxy (Firecrawl v2). AI is never used to invent leads.

import type { Lead } from "@/types/lead";
import { formatLeads, type ScrapedLeadSource } from "./groq-api";
import { scrapeApiRequest } from "./scrape-api";
import {
  contactsToLeads,
  extractContactsFromContent,
  jsonContactsToLeads,
  mergeLeadsByEmail,
  normalizeUrl,
  parseMapLinks,
  parseSearchResultUrls,
  pickContactPageUrls,
} from "./scrape-extract";

type ScrapePageData = {
  html?: string;
  markdown?: string;
  text?: string;
  links?: string[];
  content?: string;
  json?: unknown;
};

type ScrapeApiBody = {
  success?: boolean;
  error?: string;
  data?: unknown;
  links?: unknown;
  web?: unknown;
  results?: unknown;
  [key: string]: unknown;
};

const CONTACT_JSON_SCHEMA = {
  type: "object",
  properties: {
    contacts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string" },
          company: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          linkedin: { type: "string" },
        },
      },
    },
  },
};

function scrapeError(data: ScrapeApiBody, fallback: string): string {
  const err = data.error;
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}

function asPageData(data: unknown): ScrapePageData {
  if (!data || typeof data !== "object") return {};
  return data as ScrapePageData;
}

async function mapWebsite(url: string): Promise<string[]> {
  const data = await scrapeApiRequest("map", {
    body: {
      url: normalizeUrl(url),
      includeSubdomains: false,
      limit: 50,
      search: "contact team about people leadership",
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
      formats: [
        "markdown",
        "links",
        {
          type: "json",
          schema: CONTACT_JSON_SCHEMA,
          prompt:
            "Extract only real contact people and emails visible on this page. Do not invent contacts.",
        },
      ],
      onlyMainContent: false,
    },
  });

  if (data.success === false || !data.data) {
    throw new Error(scrapeError(data, `Could not scrape ${url}`));
  }

  return asPageData(data.data);
}

function pageToLeads(pageUrl: string, data: ScrapePageData, maxLeads: number): Lead[] {
  const fromJson = jsonContactsToLeads(pageUrl, data.json, maxLeads);
  const contacts = extractContactsFromContent(
    {
      html: data.html,
      markdown: data.markdown,
      text: data.text,
      links: data.links,
    },
    { prioritizeSections: true },
  );
  const fromRegex = contactsToLeads(pageUrl, contacts, maxLeads);
  return mergeLeadsByEmail([...fromJson, ...fromRegex]).slice(0, maxLeads);
}

async function optionallyFormat(
  sources: ScrapedLeadSource[],
  seedLeads: Lead[],
): Promise<Lead[]> {
  if (sources.length === 0) return seedLeads;
  try {
    const formatted = await formatLeads(sources);
    if (!formatted.length) return seedLeads;
    // Keep only emails that already appeared in scraped seed (anti-invention).
    const allowed = new Set(
      seedLeads
        .map((l) => l.email?.toLowerCase().trim())
        .filter(Boolean) as string[],
    );
    const safe = formatted
      .map((l, i) => ({
        ...l,
        id: l.id || `fmt-${Date.now()}-${i}`,
        email: (l.email || "").toLowerCase().trim(),
        website: l.website || sources[0]?.sourceUrl,
      }))
      .filter((l) => {
        if (!l.email) return false;
        if (allowed.size === 0) return Boolean(l.email);
        return allowed.has(l.email);
      });
    return safe.length > 0 ? mergeLeadsByEmail(safe) : seedLeads;
  } catch (err) {
    console.warn("format_leads skipped:", err);
    return seedLeads;
  }
}

/** Scrape a website for contacts; maps contact/about/team pages when deepScan. */
export async function scrapeWebsiteForLeads(
  url: string,
  options: {
    depth?: number;
    maxLeads?: number;
    deepScan?: boolean;
    useAiFormat?: boolean;
  } = {},
): Promise<Lead[]> {
  const { depth = 1, maxLeads = 10, deepScan = false, useAiFormat = true } =
    options;
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
  const sources: ScrapedLeadSource[] = [];
  let lastError: string | null = null;

  for (const pageUrl of uniqueUrls) {
    try {
      const data = await scrapePage(pageUrl);
      sources.push({
        sourceUrl: pageUrl,
        markdown: (data.markdown || data.text || "").slice(0, 20000),
        json: data.json,
      });
      allLeads.push(...pageToLeads(pageUrl, data, maxLeads));
      if (allLeads.length >= maxLeads) break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Scrape failed";
      console.warn(`Scrape failed for ${pageUrl}:`, err);
    }
  }

  let merged = mergeLeadsByEmail(allLeads).slice(0, maxLeads);
  if (useAiFormat && (merged.length > 0 || sources.some((s) => s.markdown))) {
    merged = (await optionallyFormat(sources, merged)).slice(0, maxLeads);
  }

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
        scrapeWebsiteForLeads(u, {
          ...options,
          maxLeads: options.maxLeads ?? 5,
        }),
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
  return scrapeUrlBatch(urls, { maxLeads: 5, deepScan: true });
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
      limit: Math.min(maxResults, 8),
      scrapeOptions: {
        formats: ["markdown", "links"],
      },
    },
  });

  if (searchData.success === false) {
    throw new Error(scrapeError(searchData, "Web search failed"));
  }

  const urls = parseSearchResultUrls(searchData).slice(0, maxResults);
  if (urls.length === 0) return [];

  return scrapeUrlBatch(urls, {
    maxLeads: Math.max(2, Math.ceil(maxResults / urls.length)),
    deepScan: true,
  }).then((leads) => leads.slice(0, maxResults));
}
