import type { Lead } from "@/types/lead";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX =
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const LINKEDIN_REGEX =
  /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[a-zA-Z0-9_-]+/gi;

const JUNK_EMAIL_PATTERNS = [
  /^noreply@/i,
  /^no-reply@/i,
  /^donotreply@/i,
  /^mailer-daemon@/i,
  /^postmaster@/i,
  /^support@sentry\./i,
  /@example\.(com|org|net)$/i,
  /@sentry\./i,
  /@wixpress\.com$/i,
  /\.png$/i,
  /\.jpg$/i,
  /\.gif$/i,
  /^your@email/i,
  /^email@/i,
  /^name@/i,
];

export const CONTACT_PAGE_KEYWORDS = [
  "contact",
  "about",
  "team",
  "staff",
  "people",
  "leadership",
  "company",
  "meet",
  "directory",
];

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

export function isValidScrapeUrl(input: string): boolean {
  try {
    const u = new URL(normalizeUrl(input));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function filterValidEmails(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const email of raw) {
    const lower = email.toLowerCase().trim();
    if (!lower.includes("@") || seen.has(lower)) continue;
    if (JUNK_EMAIL_PATTERNS.some((p) => p.test(lower))) continue;
    if (lower.length > 254) continue;
    seen.add(lower);
    out.push(lower);
  }
  return out;
}

export function extractEmailsFromText(text: string): string[] {
  if (!text) return [];
  return filterValidEmails(text.match(EMAIL_REGEX) || []);
}

export function extractPhonesFromText(text: string): string[] {
  if (!text) return [];
  return [...new Set((text.match(PHONE_REGEX) || []).map((p) => p.trim()))];
}

export function extractLinkedInFromText(
  text: string,
  links: string[] = [],
): string[] {
  const fromText = text.match(LINKEDIN_REGEX) || [];
  const fromLinks = links.filter((l) => l.includes("linkedin.com"));
  return [
    ...new Set(
      [...fromText, ...fromLinks].map((url) =>
        url.startsWith("http") ? url : `https://${url}`,
      ),
    ),
  ];
}

export function extractTargetSections(html: string): string {
  if (!html) return "";
  const header = html.match(/<header[\s\S]*?<\/header>/i)?.[0] || "";
  const footer = html.match(/<footer[\s\S]*?<\/footer>/i)?.[0] || "";
  const contact =
    html.match(/<section[^>]*contact[^>]*>[\s\S]*?<\/section>/i)?.[0] ||
    html.match(/<div[^>]*contact[^>]*>[\s\S]*?<\/div>/i)?.[0] ||
    "";
  return [header, footer, contact].join("\n");
}

export function extractContactsFromContent(
  sources: {
    html?: string;
    text?: string;
    markdown?: string;
    links?: string[];
  },
  options: { prioritizeSections?: boolean } = {},
): {
  emails: string[];
  phones: string[];
  linkedin: string[];
} {
  const html = sources.html || "";
  const text = sources.text || "";
  const markdown = sources.markdown || "";
  const links = sources.links || [];

  const prioritized = options.prioritizeSections
    ? extractTargetSections(html)
    : "";

  const blob = [prioritized, html, text, markdown, links.join("\n")].join("\n");

  return {
    emails: extractEmailsFromText(blob),
    phones: extractPhonesFromText(blob),
    linkedin: extractLinkedInFromText(blob, links),
  };
}

export function pickContactPageUrls(baseUrl: string, urls: string[]): string[] {
  const base = new URL(normalizeUrl(baseUrl));
  const baseHost = base.hostname.replace(/^www\./, "");

  const scored = urls
    .map((raw) => {
      try {
        const u = new URL(raw);
        if (u.hostname.replace(/^www\./, "") !== baseHost) return null;
        const path = u.pathname.toLowerCase();
        const score = CONTACT_PAGE_KEYWORDS.reduce(
          (s, kw) => (path.includes(kw) ? s + 1 : s),
          0,
        );
        return score > 0 ? { url: u.href, score } : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Array<{ url: string; score: number }>;

  scored.sort((a, b) => b.score - a.score);

  const picked = scored.map((s) => s.url).slice(0, 5);
  if (!picked.includes(base.href)) {
    picked.unshift(base.href);
  }
  return [...new Set(picked)];
}

export function parseMapLinks(data: unknown): string[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  const inner = obj.data as Record<string, unknown> | undefined;

  const candidates = [
    obj.links,
    inner?.links,
    Array.isArray(obj.data) ? obj.data : null,
    inner?.urls,
  ];

  for (const c of candidates) {
    if (!Array.isArray(c)) continue;
    const urls = c
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "url" in item) {
          const url = (item as { url?: string }).url;
          return typeof url === "string" ? url : null;
        }
        return null;
      })
      .filter((u): u is string => Boolean(u));
    if (urls.length > 0) return urls;
  }
  return [];
}

export function generateNameFromEmail(email: string): string {
  if (!email.includes("@")) return "Unknown";
  const namePart = email.split("@")[0];
  if (namePart.includes(".")) {
    return namePart
      .split(".")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }
  if (namePart.includes("_")) {
    return namePart
      .split("_")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

export function companyFromUrl(url: string): string {
  try {
    const name = new URL(normalizeUrl(url)).hostname
      .replace(/^www\./, "")
      .split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return "Unknown Company";
  }
}

export function contactsToLeads(
  url: string,
  contacts: { emails: string[]; phones: string[]; linkedin: string[] },
  maxLeads: number,
): Lead[] {
  const { emails, phones, linkedin } = contacts;
  const company = companyFromUrl(url);
  const leads: Lead[] = [];

  if (emails.length === 0 && phones.length === 0) return [];

  if (emails.length > 0) {
    for (let i = 0; i < Math.min(emails.length, maxLeads); i++) {
      leads.push({
        id: `scrape-${Date.now()}-${i}`,
        name: generateNameFromEmail(emails[i]),
        title: "Team Member",
        company,
        email: emails[i],
        phone: phones[i] || phones[0] || "",
        linkedin: linkedin[i] || linkedin[0] || "",
        website: url,
        industry: "Other",
        employees: "Unknown",
        location: "Unknown",
        confidenceScore: phones[i] ? 75 : 70,
      });
    }
    return leads;
  }

  leads.push({
    id: `scrape-${Date.now()}-0`,
    name: `${company} Contact`,
    title: "Team Member",
    company,
    email: "",
    phone: phones[0],
    linkedin: linkedin[0] || "",
    website: url,
    industry: "Other",
    employees: "Unknown",
    location: "Unknown",
    confidenceScore: 55,
  });
  return leads;
}

export function mergeLeadsByEmail(leads: Lead[]): Lead[] {
  const byEmail = new Map<string, Lead>();
  for (const lead of leads) {
    const key = lead.email?.toLowerCase() || lead.id;
    const existing = byEmail.get(key);
    if (!existing) {
      byEmail.set(key, lead);
      continue;
    }
    byEmail.set(key, {
      ...existing,
      phone: existing.phone || lead.phone,
      linkedin: existing.linkedin || lead.linkedin,
      confidenceScore: Math.max(
        existing.confidenceScore || 0,
        lead.confidenceScore || 0,
      ),
    });
  }
  return [...byEmail.values()];
}

export function leadsToCsv(leads: Lead[]): string {
  const header = "name,email,phone,company,title,website,linkedin";
  const rows = leads.map((l) =>
    [l.name, l.email, l.phone, l.company, l.title, l.website, l.linkedin]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}
