// Firecrawl API integration for web scraping and lead generation

const FIRECRAWL_API_KEY = "fc-01e68c0f41394d9491ec4d0e2fdfef75";
const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1";

import { Lead } from "./gemini-api";

interface FirecrawlRequestBody {
  url: string;
  selectors?: Record<string, string>;
  options?: {
    waitForSelector?: string;
    javascript?: boolean;
    timeout?: number;
    proxy?: string;
  };
}

interface FirecrawlResponse {
  success: boolean;
  data: Record<string, any>;
  error?: string;
}

/**
 * Scrape a website for contact information and leads
 * @param url The URL to scrape
 * @param options Additional options for the scraper
 * @returns Array of leads found on the website
 */
export async function scrapeWebsiteForLeads(
  url: string,
  options: {
    depth?: number;
    maxLeads?: number;
    includeEmails?: boolean;
    includePhones?: boolean;
    includeLinkedIn?: boolean;
  } = {},
): Promise<Lead[]> {
  try {
    const {
      depth = 1,
      maxLeads = 10,
      includeEmails = true,
      includePhones = true,
      includeLinkedIn = true,
    } = options;

    // Define selectors to look for contact information
    const selectors = {
      emails: "a[href^='mailto:'], *:contains(@)",
      phones: "a[href^='tel:'], *:contains(+), *:contains(()",
      names:
        ".team-member, .employee, .staff, .about-us h3, .contact h3, .profile h3",
      titles: ".job-title, .position, .role, .title",
      linkedin: "a[href*='linkedin.com']",
      companyInfo: ".company-info, .about-company, footer, .contact-info",
    };

    const requestBody: FirecrawlRequestBody = {
      url,
      selectors,
      options: {
        javascript: true,
        timeout: 30000,
        waitForSelector: "body",
      },
    };

    const response = await fetch(`${FIRECRAWL_API_URL}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Firecrawl API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: FirecrawlResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Unknown error from Firecrawl API");
    }

    // Process the scraped data into leads
    const leads: Lead[] = [];
    const companyName = extractCompanyName(url, data.data.companyInfo);
    const domain = new URL(url).hostname;

    // Extract emails
    const emails = extractEmails(data.data.emails);

    // Extract names
    const names = extractNames(data.data.names);

    // Extract titles
    const titles = extractTitles(data.data.titles);

    // Extract phones
    const phones = extractPhones(data.data.phones);

    // Extract LinkedIn profiles
    const linkedInProfiles = extractLinkedIn(data.data.linkedin);

    // Create leads from the extracted data
    // Match emails with names and titles where possible
    for (let i = 0; i < Math.min(emails.length, maxLeads); i++) {
      const email = emails[i];
      const name = i < names.length ? names[i] : generateNameFromEmail(email);
      const title = i < titles.length ? titles[i] : "Team Member";
      const phone = i < phones.length ? phones[i] : "";
      const linkedin = i < linkedInProfiles.length ? linkedInProfiles[i] : "";

      leads.push({
        id: `firecrawl-${Date.now()}-${i}`,
        name,
        title,
        company: companyName,
        email,
        phone,
        linkedin,
        website: url,
        industry: detectIndustry(url, data.data.companyInfo),
        employees: "Unknown",
        location: detectLocation(data.data.companyInfo),
        confidenceScore: 70,
      });
    }

    return leads;
  } catch (error) {
    console.error("Error scraping website with Firecrawl:", error);
    return [];
  }
}

/**
 * Scrape multiple domains for leads
 * @param domains Array of domains to scrape
 * @returns Array of leads found across all domains
 */
export async function scrapeDomainBatch(domains: string[]): Promise<Lead[]> {
  try {
    const allLeads: Lead[] = [];

    // Process domains in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < domains.length; i += batchSize) {
      const domainBatch = domains.slice(i, i + batchSize);

      // Process each domain in the batch
      const batchPromises = domainBatch.map((domain) => {
        const url = domain.startsWith("http") ? domain : `https://${domain}`;
        return scrapeWebsiteForLeads(url, { maxLeads: 3 });
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Collect successful results
      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.length > 0) {
          allLeads.push(...result.value);
        }
      });

      // Add a small delay between batches
      if (i + batchSize < domains.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return allLeads;
  } catch (error) {
    console.error("Error scraping domain batch with Firecrawl:", error);
    return [];
  }
}

/**
 * Search for leads based on specific criteria and scrape relevant websites
 * @param query Search query (e.g., "marketing managers in tech companies")
 * @param options Search options
 * @returns Array of leads matching the search criteria
 */
export async function searchAndScrapeLeads(
  query: string,
  options: {
    maxResults?: number;
    location?: string;
    industry?: string;
  } = {},
): Promise<Lead[]> {
  try {
    const { maxResults = 10, location, industry } = options;

    // First, search for relevant websites based on the query
    const searchUrl = new URL(`${FIRECRAWL_API_URL}/search`);
    searchUrl.searchParams.append("q", query);
    if (location) searchUrl.searchParams.append("location", location);
    if (industry) searchUrl.searchParams.append("industry", industry);
    searchUrl.searchParams.append("limit", maxResults.toString());

    const searchResponse = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
    });

    if (!searchResponse.ok) {
      throw new Error(
        `Firecrawl search API error: ${searchResponse.status} ${searchResponse.statusText}`,
      );
    }

    const searchData = await searchResponse.json();

    if (
      !searchData.success ||
      !searchData.data ||
      !Array.isArray(searchData.data.results)
    ) {
      throw new Error(
        searchData.error || "Invalid search results from Firecrawl API",
      );
    }

    // Extract URLs from search results
    const urls = searchData.data.results
      .map((result: any) => result.url)
      .filter(Boolean);

    if (urls.length === 0) {
      return [];
    }

    // Scrape each URL for leads
    const allLeads: Lead[] = [];

    // Process URLs in batches
    const batchSize = 3;
    for (
      let i = 0;
      i < urls.length && allLeads.length < maxResults;
      i += batchSize
    ) {
      const urlBatch = urls.slice(i, i + batchSize);

      const batchPromises = urlBatch.map((url) =>
        scrapeWebsiteForLeads(url, {
          maxLeads: Math.ceil(maxResults / urls.length) + 1,
        }),
      );

      const batchResults = await Promise.allSettled(batchPromises);

      // Collect successful results
      batchResults.forEach((result) => {
        if (result.status === "fulfilled" && result.value.length > 0) {
          allLeads.push(...result.value);
        }
      });

      // Add a small delay between batches
      if (i + batchSize < urls.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Limit to requested number of results
    return allLeads.slice(0, maxResults);
  } catch (error) {
    console.error("Error searching and scraping with Firecrawl:", error);
    return [];
  }
}

// Helper functions
function extractEmails(emailData: any): string[] {
  if (!emailData) return [];

  // Handle different data formats
  if (Array.isArray(emailData)) {
    return emailData.filter(
      (email) => typeof email === "string" && email.includes("@"),
    );
  }

  if (typeof emailData === "string") {
    // Extract emails from text using regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = emailData.match(emailRegex);
    return matches || [];
  }

  return [];
}

function extractNames(nameData: any): string[] {
  if (!nameData) return [];

  if (Array.isArray(nameData)) {
    return nameData.filter(
      (name) => typeof name === "string" && name.trim().length > 0,
    );
  }

  if (typeof nameData === "string") {
    // Split by common separators and filter out empty strings
    return nameData
      .split(/[,\n\r]/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  }

  return [];
}

function extractTitles(titleData: any): string[] {
  if (!titleData) return [];

  if (Array.isArray(titleData)) {
    return titleData.filter(
      (title) => typeof title === "string" && title.trim().length > 0,
    );
  }

  if (typeof titleData === "string") {
    return titleData
      .split(/[,\n\r]/)
      .map((title) => title.trim())
      .filter((title) => title.length > 0);
  }

  return [];
}

function extractPhones(phoneData: any): string[] {
  if (!phoneData) return [];

  if (Array.isArray(phoneData)) {
    return phoneData.filter(
      (phone) => typeof phone === "string" && /[0-9]/.test(phone),
    );
  }

  if (typeof phoneData === "string") {
    // Extract phone numbers using regex
    const phoneRegex =
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const matches = phoneData.match(phoneRegex);
    return matches || [];
  }

  return [];
}

function extractLinkedIn(linkedinData: any): string[] {
  if (!linkedinData) return [];

  if (Array.isArray(linkedinData)) {
    return linkedinData
      .filter((url) => typeof url === "string" && url.includes("linkedin.com"))
      .map((url) => (url.startsWith("http") ? url : `https://${url}`));
  }

  if (typeof linkedinData === "string") {
    // Extract LinkedIn URLs using regex
    const linkedinRegex =
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[a-zA-Z0-9_-]+/g;
    const matches = linkedinData.match(linkedinRegex);
    return matches
      ? matches.map((url) => (url.startsWith("http") ? url : `https://${url}`))
      : [];
  }

  return [];
}

function extractCompanyName(url: string, companyInfo: any): string {
  // Try to extract company name from company info
  if (typeof companyInfo === "string" && companyInfo.length > 0) {
    // Look for common patterns like "Company Name, Inc." or "About Company Name"
    const nameRegex = /(?:About\s+|Company:\s*|\s+Inc\.?|\s+LLC\.?|\s+Ltd\.?)/i;
    const matches = companyInfo.match(nameRegex);
    if (matches && matches.length > 0) {
      // Extract the company name based on the match
      const index = companyInfo.indexOf(matches[0]);
      if (index > 0) {
        // Get the text before the match (up to 30 chars)
        return companyInfo.substring(Math.max(0, index - 30), index).trim();
      }
    }
  }

  // Fallback: Extract from domain
  try {
    const domain = new URL(url).hostname;
    // Remove www. and .com/.org/etc.
    const name = domain.replace(/^www\./, "").split(".")[0];
    // Convert to title case
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch (e) {
    return "Unknown Company";
  }
}

function detectIndustry(url: string, companyInfo: any): string {
  // List of common industries and their keywords
  const industries = {
    Technology: [
      "tech",
      "software",
      "app",
      "digital",
      "IT",
      "computer",
      "cloud",
      "SaaS",
      "AI",
      "data",
    ],
    Healthcare: [
      "health",
      "medical",
      "hospital",
      "care",
      "clinic",
      "pharma",
      "doctor",
      "patient",
    ],
    Finance: [
      "finance",
      "bank",
      "invest",
      "money",
      "capital",
      "fund",
      "wealth",
      "insurance",
    ],
    Education: [
      "education",
      "school",
      "university",
      "college",
      "learn",
      "teach",
      "student",
      "academic",
    ],
    Retail: [
      "retail",
      "shop",
      "store",
      "ecommerce",
      "commerce",
      "product",
      "consumer",
      "buy",
    ],
    Manufacturing: [
      "manufacturing",
      "factory",
      "production",
      "industrial",
      "machine",
      "equipment",
    ],
    "Real Estate": [
      "real estate",
      "property",
      "home",
      "house",
      "apartment",
      "rent",
      "lease",
    ],
    Marketing: [
      "marketing",
      "advertis",
      "brand",
      "media",
      "PR",
      "promotion",
      "campaign",
    ],
    Legal: [
      "legal",
      "law",
      "attorney",
      "lawyer",
      "firm",
      "counsel",
      "compliance",
    ],
    Hospitality: [
      "hotel",
      "restaurant",
      "travel",
      "tourism",
      "hospitality",
      "vacation",
      "booking",
    ],
  };

  // Combine URL and company info for analysis
  const textToAnalyze = `${url} ${typeof companyInfo === "string" ? companyInfo : ""}`;

  // Check each industry's keywords
  let bestMatch = "";
  let highestScore = 0;

  for (const [industry, keywords] of Object.entries(industries)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, "i");
      if (regex.test(textToAnalyze)) {
        score++;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = industry;
    }
  }

  return highestScore > 0 ? bestMatch : "Other";
}

function detectLocation(companyInfo: any): string {
  if (!companyInfo || typeof companyInfo !== "string") {
    return "Unknown";
  }

  // Look for common location patterns
  // 1. City, State/Province format
  const cityStateRegex = /([A-Za-z\s\.]+),\s*([A-Z]{2}|[A-Za-z\s\.]+)/g;
  const cityStateMatches = [...companyInfo.matchAll(cityStateRegex)];

  if (cityStateMatches.length > 0) {
    for (const match of cityStateMatches) {
      // Verify this isn't just a random comma in text
      if (match[1].length > 2 && match[1].length < 20) {
        return `${match[1].trim()}, ${match[2].trim()}`;
      }
    }
  }

  // 2. Look for postal/zip codes
  const postalRegex = /([A-Za-z\s\.]+)\s+([A-Z0-9]{5,7})/g;
  const postalMatches = [...companyInfo.matchAll(postalRegex)];

  if (postalMatches.length > 0) {
    return postalMatches[0][1].trim();
  }

  // 3. Look for common location words
  const locationWords = [
    "located in",
    "based in",
    "headquarters",
    "HQ",
    "office",
  ];
  for (const word of locationWords) {
    const index = companyInfo.toLowerCase().indexOf(word);
    if (index >= 0) {
      // Extract text after the location word (up to 30 chars)
      const locationText = companyInfo.substring(
        index + word.length,
        index + word.length + 30,
      );
      // Look for the first sentence or comma-separated part
      const endIndex = Math.min(
        locationText.indexOf(".") > 0 ? locationText.indexOf(".") : Infinity,
        locationText.indexOf(",") > 0 ? locationText.indexOf(",") : Infinity,
        locationText.indexOf("\n") > 0 ? locationText.indexOf("\n") : Infinity,
      );

      if (endIndex < Infinity) {
        return locationText.substring(0, endIndex).trim();
      }
    }
  }

  return "Unknown";
}

function generateNameFromEmail(email: string): string {
  if (!email || !email.includes("@")) return "Unknown";

  // Extract the part before the @ symbol
  const namePart = email.split("@")[0];

  // Handle different email formats
  if (namePart.includes(".")) {
    // Format: first.last@domain.com
    const parts = namePart.split(".");
    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } else if (namePart.includes("_")) {
    // Format: first_last@domain.com
    const parts = namePart.split("_");
    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } else {
    // Format: firstlast@domain.com or other
    // Try to split by capital letters
    const splitByCapital = namePart.replace(/([A-Z])/g, " $1").trim();
    if (splitByCapital !== namePart) {
      return splitByCapital;
    }

    // Just capitalize the first letter
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }
}
