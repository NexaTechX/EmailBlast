// FireCrawl JS integration for web scraping and lead generation

const FIRECRAWL_API_KEY = "fc-01e68c0f41394d9491ec4d0e2fdfef75";

import { Lead } from "./gemini-api";

/**
 * Scrape a URL using the FireCrawl JS library
 * @param url The URL to scrape
 * @param options Additional options for the scraper
 * @returns Scraped content in various formats
 */
export async function scrapeUrlWithFireCrawl(
  url: string,
  options: {
    formats?: string[];
    includeSubdomains?: boolean;
    ignoreSitemap?: boolean;
  } = {},
): Promise<any> {
  try {
    const {
      formats = ["markdown", "html", "links"],
      includeSubdomains = false,
      ignoreSitemap = true,
    } = options;

    // Use the FireCrawl API directly since we can't import the library in this environment
    const requestBody = {
      url,
      formats,
      includeSubdomains,
      ignoreSitemap,
    };

    const response = await fetch(`https://api.firecrawl.dev/v1/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `FireCrawl API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error scraping URL with FireCrawl:", error);
    throw error;
  }
}

/**
 * Map a website to discover all pages and content
 * @param url The URL to map
 * @param options Additional options for the mapper
 * @returns Site map with all discovered pages
 */
export async function mapWebsiteWithFireCrawl(
  url: string,
  options: {
    includeSubdomains?: boolean;
    ignoreSitemap?: boolean;
  } = {},
): Promise<any> {
  try {
    const { includeSubdomains = true, ignoreSitemap = true } = options;

    const requestBody = {
      url,
      includeSubdomains,
      ignoreSitemap,
    };

    const response = await fetch(`https://api.firecrawl.dev/v1/map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `FireCrawl map API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error mapping website with FireCrawl:", error);
    throw error;
  }
}

/**
 * Extract contact information from a website and convert to leads
 * @param url The URL to extract contacts from
 * @returns Array of leads found on the website
 */
export async function extractContactsFromWebsite(url: string): Promise<Lead[]> {
  try {
    // First, scrape the website
    const scrapedData = await scrapeUrlWithFireCrawl(url, {
      formats: ["html", "links", "text"],
    });

    if (!scrapedData || !scrapedData.success) {
      throw new Error("Failed to scrape website");
    }

    const htmlContent = scrapedData.data.html || "";
    const textContent = scrapedData.data.text || "";
    const links = scrapedData.data.links || [];

    // Extract emails using regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = [
      ...new Set([
        ...(htmlContent.match(emailRegex) || []),
        ...(textContent.match(emailRegex) || []),
      ]),
    ];

    // Extract phones using regex
    const phoneRegex =
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = [
      ...new Set([
        ...(htmlContent.match(phoneRegex) || []),
        ...(textContent.match(phoneRegex) || []),
      ]),
    ];

    // Extract LinkedIn profiles
    const linkedinRegex =
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[a-zA-Z0-9_-]+/g;
    const linkedinProfiles = [
      ...new Set([
        ...(htmlContent.match(linkedinRegex) || []),
        ...links.filter((link: string) => link.includes("linkedin.com")),
      ]),
    ].map((url: string) => (url.startsWith("http") ? url : `https://${url}`));

    // If we found emails or phones, create leads
    if (emails.length > 0 || phones.length > 0) {
      const domain = new URL(url).hostname;
      const companyName = domain.replace(/^www\./, "").split(".")[0];
      const formattedCompanyName =
        companyName.charAt(0).toUpperCase() + companyName.slice(1);

      const leads: Lead[] = [];

      // If we have both emails and phones, try to match them up
      if (emails.length > 0 && phones.length > 0) {
        // Create one lead per email with a phone if available
        emails.forEach((email, index) => {
          leads.push({
            id: `firecrawl-${Date.now()}-${index}`,
            name: generateNameFromEmail(email),
            title: "Team Member",
            company: formattedCompanyName,
            email: email,
            phone: index < phones.length ? phones[index] : phones[0],
            linkedin:
              index < linkedinProfiles.length ? linkedinProfiles[index] : "",
            website: url,
            industry: detectIndustryFromURL(url),
            location: "Unknown",
            confidenceScore: 75,
          });
        });
      } else if (emails.length > 0) {
        // Create one lead per email
        emails.forEach((email, index) => {
          leads.push({
            id: `firecrawl-${Date.now()}-${index}`,
            name: generateNameFromEmail(email),
            title: "Team Member",
            company: formattedCompanyName,
            email: email,
            phone: "",
            linkedin:
              index < linkedinProfiles.length ? linkedinProfiles[index] : "",
            website: url,
            industry: detectIndustryFromURL(url),
            location: "Unknown",
            confidenceScore: 70,
          });
        });
      } else if (phones.length > 0) {
        // Create one lead with the company info and first phone
        leads.push({
          id: `firecrawl-${Date.now()}-0`,
          name: `${formattedCompanyName} Contact`,
          title: "Team Member",
          company: formattedCompanyName,
          email: `contact@${domain}`,
          phone: phones[0],
          linkedin: linkedinProfiles.length > 0 ? linkedinProfiles[0] : "",
          website: url,
          industry: detectIndustryFromURL(url),
          location: "Unknown",
          confidenceScore: 60,
        });
      }

      return leads;
    }

    return [];
  } catch (error) {
    console.error("Error extracting contacts with FireCrawl:", error);
    return [];
  }
}

/**
 * Extract contact information from a social media profile
 * @param url The social media profile URL
 * @returns Array of leads found on the profile
 */
export async function extractContactsFromSocialMedia(
  url: string,
): Promise<Lead[]> {
  try {
    // Determine the type of social media
    const isLinkedIn = url.includes("linkedin.com");
    const isTwitter = url.includes("twitter.com") || url.includes("x.com");
    const isFacebook = url.includes("facebook.com");
    const isInstagram = url.includes("instagram.com");

    // Scrape the profile
    const scrapedData = await scrapeUrlWithFireCrawl(url, {
      formats: ["html", "text"],
    });

    if (!scrapedData || !scrapedData.success) {
      throw new Error("Failed to scrape social media profile");
    }

    const htmlContent = scrapedData.data.html || "";
    const textContent = scrapedData.data.text || "";

    // Extract profile information based on the platform
    let name = "";
    let title = "";
    let company = "";

    if (isLinkedIn) {
      // Extract name from LinkedIn (typically in heading elements)
      const nameMatch =
        htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
        htmlContent.match(/<title>([^|]+)\s*\|/i);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      }

      // Extract title and company
      const titleMatch =
        htmlContent.match(/<h2[^>]*>([^<]+)<\/h2>/i) ||
        textContent.match(/(?:at|@)\s+([^,\.\n]+)/i);
      if (titleMatch && titleMatch[1]) {
        const titleText = titleMatch[1].trim();
        // Try to split into title and company if it contains "at"
        if (titleText.includes(" at ")) {
          const parts = titleText.split(" at ");
          title = parts[0].trim();
          company = parts[1].trim();
        } else {
          title = titleText;
        }
      }
    } else if (isTwitter) {
      // Extract name from Twitter
      const nameMatch =
        htmlContent.match(/<title>([^(]+)\s*\(/i) ||
        htmlContent.match(
          /<div[^>]*aria-label="Profile"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i,
        );
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      }

      // Extract bio which might contain title/company
      const bioMatch = htmlContent.match(
        /<div[^>]*role="presentation"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i,
      );
      if (bioMatch && bioMatch[1]) {
        const bioText = bioMatch[1].trim();
        if (bioText.includes(" at ")) {
          const parts = bioText.split(" at ");
          title = parts[0].trim();
          company = parts[1].trim();
        } else {
          title = bioText;
        }
      }
    } else if (isFacebook || isInstagram) {
      // Extract name from Facebook/Instagram
      const nameMatch =
        htmlContent.match(/<title>([^|]+)\s*\|/i) ||
        htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      }

      // Extract bio which might contain title/company
      const bioMatch = htmlContent.match(
        /<div[^>]*class="[^"]*bio[^"]*"[^>]*>([^<]+)<\/div>/i,
      );
      if (bioMatch && bioMatch[1]) {
        const bioText = bioMatch[1].trim();
        if (bioText.includes(" at ")) {
          const parts = bioText.split(" at ");
          title = parts[0].trim();
          company = parts[1].trim();
        } else {
          title = bioText;
        }
      }
    }

    // Extract emails and phones using regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = [
      ...new Set([
        ...(htmlContent.match(emailRegex) || []),
        ...(textContent.match(emailRegex) || []),
      ]),
    ];

    const phoneRegex =
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = [
      ...new Set([
        ...(htmlContent.match(phoneRegex) || []),
        ...(textContent.match(phoneRegex) || []),
      ]),
    ];

    // Create a lead if we have enough information
    if (name || emails.length > 0) {
      const lead: Lead = {
        id: `social-${Date.now()}-0`,
        name:
          name ||
          (emails.length > 0 ? generateNameFromEmail(emails[0]) : "Unknown"),
        title: title || "Professional",
        company: company || "",
        email: emails.length > 0 ? emails[0] : "",
        phone: phones.length > 0 ? phones[0] : "",
        linkedin: isLinkedIn ? url : "",
        website: "",
        industry: "",
        location: "Unknown",
        confidenceScore: 65,
      };

      return [lead];
    }

    return [];
  } catch (error) {
    console.error("Error extracting contacts from social media:", error);
    return [];
  }
}

// Helper function to generate a name from an email
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

// Helper function to detect industry from URL
function detectIndustryFromURL(url: string): string {
  const urlLower = url.toLowerCase();

  if (
    urlLower.includes("tech") ||
    urlLower.includes("software") ||
    urlLower.includes("digital") ||
    urlLower.includes("app")
  ) {
    return "Technology";
  } else if (
    urlLower.includes("health") ||
    urlLower.includes("med") ||
    urlLower.includes("care") ||
    urlLower.includes("clinic")
  ) {
    return "Healthcare";
  } else if (
    urlLower.includes("finance") ||
    urlLower.includes("bank") ||
    urlLower.includes("invest") ||
    urlLower.includes("capital")
  ) {
    return "Finance";
  } else if (
    urlLower.includes("shop") ||
    urlLower.includes("store") ||
    urlLower.includes("retail") ||
    urlLower.includes("market")
  ) {
    return "Retail";
  } else {
    return "Other";
  }
}
