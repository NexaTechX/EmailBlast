import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { scrapeWebsiteForLeads } from "@/lib/firecrawl";
import { Lead } from "./lead-database";
import {
  Search,
  RefreshCw,
  Sparkles,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
} from "lucide-react";

export function SocialScraper({ onLeadsFound = (leads: Lead[]) => {} }) {
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("website");
  const [scrapedLeads, setScrapedLeads] = useState<Lead[]>([]);
  const { toast } = useToast();

  const handleScrape = async () => {
    if (!url) {
      toast({
        variant: "destructive",
        title: "URL required",
        description: "Please enter a valid URL to scrape.",
      });
      return;
    }

    // Validate URL format
    let formattedUrl = url;
    if (!url.startsWith("http")) {
      formattedUrl = `https://${url}`;
    }

    try {
      new URL(formattedUrl);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid website or social media URL.",
      });
      return;
    }

    setScraping(true);
    setProgress(10);

    try {
      toast({
        title: "Scraping started",
        description: "Extracting contact information from the provided URL...",
      });

      // Determine the type of URL for specialized scraping
      const isLinkedIn = formattedUrl.includes("linkedin.com");
      const isTwitter =
        formattedUrl.includes("twitter.com") || formattedUrl.includes("x.com");
      const isFacebook = formattedUrl.includes("facebook.com");
      const isInstagram = formattedUrl.includes("instagram.com");

      setProgress(30);

      // Use the appropriate scraping method based on URL type
      let leads: Lead[] = [];

      if (isLinkedIn) {
        // LinkedIn-specific scraping options
        leads = await scrapeWebsiteForLeads(formattedUrl, {
          maxLeads: 5,
          includeEmails: true,
          includePhones: true,
          includeLinkedIn: true,
        });
      } else if (isTwitter || isFacebook || isInstagram) {
        // Social media profile scraping
        leads = await scrapeWebsiteForLeads(formattedUrl, {
          maxLeads: 1,
          includeEmails: true,
          includePhones: true,
        });
      } else {
        // Regular website scraping
        leads = await scrapeWebsiteForLeads(formattedUrl, {
          maxLeads: 10,
          depth: 2,
        });
      }

      setProgress(80);

      if (leads.length > 0) {
        setScrapedLeads(leads);
        onLeadsFound(leads);
        toast({
          title: "Scraping complete",
          description: `Found ${leads.length} contacts from ${formattedUrl}`,
        });
      } else {
        // If no leads found through scraping, try to extract contact info directly from the page
        try {
          const directScrapeLeads =
            await extractContactInfoFromURL(formattedUrl);
          if (directScrapeLeads.length > 0) {
            setScrapedLeads(directScrapeLeads);
            onLeadsFound(directScrapeLeads);
            toast({
              title: "Contact info found",
              description: `Found ${directScrapeLeads.length} contacts from ${formattedUrl}`,
            });
          } else {
            toast({
              variant: "destructive",
              title: "No contacts found",
              description:
                "Could not extract any contact information from this URL.",
            });
          }
        } catch (directScrapeError) {
          console.error("Error with direct scraping:", directScrapeError);
          toast({
            variant: "destructive",
            title: "No contacts found",
            description:
              "Could not extract any contact information from this URL.",
          });
        }
      }
    } catch (error) {
      console.error("Error scraping URL:", error);
      toast({
        variant: "destructive",
        title: "Scraping failed",
        description:
          "An error occurred while scraping the URL. Please try again.",
      });
    } finally {
      setScraping(false);
      setProgress(100);
    }
  };

  // Function to extract contact info directly from a URL
  const extractContactInfoFromURL = async (url: string): Promise<Lead[]> => {
    // This is a more aggressive approach to find contact information
    const selectors = {
      // Target common contact page elements
      contactInfo:
        ".contact-info, .contact-details, .contact-us, #contact, .contact, footer, .footer",
      // Target email patterns more aggressively
      emails: "a[href^='mailto:'], [href*='@'], [contains(@)], *:contains(@)",
      // Target phone patterns more aggressively
      phones: "a[href^='tel:'], [href*='tel:'], *:contains(+), *:contains(())",
    };

    try {
      const requestBody = {
        url,
        selectors,
        options: {
          javascript: true,
          timeout: 30000,
          waitForSelector: "body",
          // Extract full HTML content
          extractHtml: true,
        },
      };

      const response = await fetch(`https://api.firecrawl.dev/v1/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer fc-01e68c0f41394d9491ec4d0e2fdfef75`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Unknown error");
      }

      // Extract contact information from the scraped data
      const htmlContent = data.data.html || "";
      const contactText = data.data.contactInfo || "";

      // Extract emails using regex
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = [
        ...new Set([
          ...(htmlContent.match(emailRegex) || []),
          ...(contactText.match(emailRegex) || []),
        ]),
      ];

      // Extract phones using regex
      const phoneRegex =
        /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      const phones = [
        ...new Set([
          ...(htmlContent.match(phoneRegex) || []),
          ...(contactText.match(phoneRegex) || []),
        ]),
      ];

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
              id: `direct-${Date.now()}-${index}`,
              name: generateNameFromEmail(email),
              title: "Team Member",
              company: formattedCompanyName,
              email: email,
              phone: index < phones.length ? phones[index] : phones[0],
              website: url,
              industry: detectIndustryFromURL(url),
              location: "Unknown",
              confidenceScore: 60,
            });
          });
        } else if (emails.length > 0) {
          // Create one lead per email
          emails.forEach((email, index) => {
            leads.push({
              id: `direct-${Date.now()}-${index}`,
              name: generateNameFromEmail(email),
              title: "Team Member",
              company: formattedCompanyName,
              email: email,
              phone: "",
              website: url,
              industry: detectIndustryFromURL(url),
              location: "Unknown",
              confidenceScore: 60,
            });
          });
        } else if (phones.length > 0) {
          // Create one lead with the company info and first phone
          leads.push({
            id: `direct-${Date.now()}-0`,
            name: `${formattedCompanyName} Contact`,
            title: "Team Member",
            company: formattedCompanyName,
            email: `contact@${domain}`,
            phone: phones[0],
            website: url,
            industry: detectIndustryFromURL(url),
            location: "Unknown",
            confidenceScore: 50,
          });
        }

        return leads;
      }

      return [];
    } catch (error) {
      console.error("Error extracting contact info:", error);
      return [];
    }
  };

  // Helper function to generate a name from an email
  const generateNameFromEmail = (email: string): string => {
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
  };

  // Helper function to detect industry from URL
  const detectIndustryFromURL = (url: string): string => {
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
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Contact Finder</h3>
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          Web Scraping
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="website" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website-url">Enter Website URL</Label>
              <div className="flex gap-2">
                <Input
                  id="website-url"
                  placeholder="e.g., example.com or https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button onClick={handleScrape} disabled={scraping || !url}>
                  {scraping ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  {scraping ? "Scraping..." : "Find Contacts"}
                </Button>
              </div>
            </div>

            {scraping && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scraping website...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                💡 <strong>Tips for website scraping:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Try the company's "About Us" or "Contact" pages for best
                  results
                </li>
                <li>
                  Corporate websites often list team members with contact
                  details
                </li>
                <li>
                  Look for pages with employee directories or team sections
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin-url">
                Enter LinkedIn Profile or Company URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="linkedin-url"
                  placeholder="e.g., linkedin.com/in/username or linkedin.com/company/name"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button onClick={handleScrape} disabled={scraping || !url}>
                  {scraping ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Linkedin className="h-4 w-4 mr-2" />
                  )}
                  {scraping ? "Scraping..." : "Find Contact"}
                </Button>
              </div>
            </div>

            {scraping && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scraping LinkedIn profile...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                💡 <strong>Tips for LinkedIn scraping:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Public LinkedIn profiles provide the most information</li>
                <li>Company pages often list key employees and their roles</li>
                <li>Look for "Contact info" sections on profiles</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="social-url">Enter Social Media Profile URL</Label>
              <div className="flex gap-2">
                <Input
                  id="social-url"
                  placeholder="e.g., twitter.com/username or facebook.com/username"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button onClick={handleScrape} disabled={scraping || !url}>
                  {scraping ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  {scraping ? "Scraping..." : "Find Contact"}
                </Button>
              </div>
            </div>

            {scraping && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scraping social profile...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrl("twitter.com/")}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter/X
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrl("facebook.com/")}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrl("instagram.com/")}
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                💡 <strong>Tips for social media scraping:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Business profiles often include contact information in their
                  bio
                </li>
                <li>
                  Look for profiles that have "Contact" or "About" sections
                </li>
                <li>
                  Professional accounts typically have more contact details
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
