import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Lead } from "./lead-database";
import {
  Search,
  RefreshCw,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  Phone,
  Link,
} from "lucide-react";

export function FirecrawlScraper({ onLeadsFound = (leads: Lead[]) => {} }) {
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

      // Use FireCrawl JS library to scrape the URL
      const firecrawlApp = {
        apiKey: "fc-01e68c0f41394d9491ec4d0e2fdfef75",
      };

      setProgress(30);

      // Make the API request directly
      const requestBody = {
        url: formattedUrl,
        formats: ["markdown", "html", "links", "text"],
      };

      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firecrawlApp.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setProgress(60);

      if (!data.success) {
        throw new Error(data.error || "Unknown error");
      }

      // Extract contact information from the scraped data
      const htmlContent = data.data.html || "";
      const textContent = data.data.text || "";
      const links = data.data.links || [];

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

      setProgress(80);

      // If we found emails or phones, create leads
      if (emails.length > 0 || phones.length > 0) {
        const domain = new URL(formattedUrl).hostname;
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
              website: formattedUrl,
              industry: detectIndustryFromURL(formattedUrl),
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
              website: formattedUrl,
              industry: detectIndustryFromURL(formattedUrl),
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
            website: formattedUrl,
            industry: detectIndustryFromURL(formattedUrl),
            location: "Unknown",
            confidenceScore: 60,
          });
        }

        setScrapedLeads(leads);
        setActiveTab("results");
        toast({
          title: "Scraping complete",
          description: `Found ${leads.length} contacts from ${formattedUrl}`,
        });
      } else {
        // Try to scrape the site map to find contact pages
        try {
          setProgress(85);
          const mapRequestBody = {
            url: formattedUrl,
            includeSubdomains: true,
            ignoreSitemap: false,
          };

          const mapResponse = await fetch("https://api.firecrawl.dev/v1/map", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${firecrawlApp.apiKey}`,
            },
            body: JSON.stringify(mapRequestBody),
          });

          if (!mapResponse.ok) {
            throw new Error(`Map API error: ${mapResponse.status}`);
          }

          const mapData = await mapResponse.json();
          setProgress(90);

          if (!mapData.success) {
            throw new Error(mapData.error || "Unknown error");
          }

          // Look for contact pages in the site map
          const pages = mapData.data.pages || [];
          const contactPages = pages.filter((page: any) => {
            const url = page.url.toLowerCase();
            return (
              url.includes("contact") ||
              url.includes("about") ||
              url.includes("team")
            );
          });

          if (contactPages.length > 0) {
            // Scrape the first contact page
            const contactPage = contactPages[0];
            const contactRequestBody = {
              url: contactPage.url,
              formats: ["html", "text", "links"],
            };

            const contactResponse = await fetch(
              "https://api.firecrawl.dev/v1/scrape",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${firecrawlApp.apiKey}`,
                },
                body: JSON.stringify(contactRequestBody),
              },
            );

            if (!contactResponse.ok) {
              throw new Error(`Contact API error: ${contactResponse.status}`);
            }

            const contactData = await contactResponse.json();
            setProgress(95);

            if (!contactData.success) {
              throw new Error(contactData.error || "Unknown error");
            }

            // Extract contact information from the contact page
            const contactHtml = contactData.data.html || "";
            const contactText = contactData.data.text || "";
            const contactLinks = contactData.data.links || [];

            // Extract emails and phones
            const contactEmails = [
              ...new Set([
                ...(contactHtml.match(emailRegex) || []),
                ...(contactText.match(emailRegex) || []),
              ]),
            ];

            const contactPhones = [
              ...new Set([
                ...(contactHtml.match(phoneRegex) || []),
                ...(contactText.match(phoneRegex) || []),
              ]),
            ];

            // Extract LinkedIn profiles
            const contactLinkedin = [
              ...new Set([
                ...(contactHtml.match(linkedinRegex) || []),
                ...contactLinks.filter((link: string) =>
                  link.includes("linkedin.com"),
                ),
              ]),
            ].map((url: string) =>
              url.startsWith("http") ? url : `https://${url}`,
            );

            // If we found contacts on the contact page, create leads
            if (contactEmails.length > 0 || contactPhones.length > 0) {
              const domain = new URL(formattedUrl).hostname;
              const companyName = domain.replace(/^www\./, "").split(".")[0];
              const formattedCompanyName =
                companyName.charAt(0).toUpperCase() + companyName.slice(1);

              const leads: Lead[] = [];

              // Create leads from contact page information
              if (contactEmails.length > 0) {
                contactEmails.forEach((email, index) => {
                  leads.push({
                    id: `firecrawl-contact-${Date.now()}-${index}`,
                    name: generateNameFromEmail(email),
                    title: "Team Member",
                    company: formattedCompanyName,
                    email: email,
                    phone:
                      index < contactPhones.length ? contactPhones[index] : "",
                    linkedin:
                      index < contactLinkedin.length
                        ? contactLinkedin[index]
                        : "",
                    website: formattedUrl,
                    industry: detectIndustryFromURL(formattedUrl),
                    location: "Unknown",
                    confidenceScore: 80,
                  });
                });
              } else if (contactPhones.length > 0) {
                leads.push({
                  id: `firecrawl-contact-${Date.now()}-0`,
                  name: `${formattedCompanyName} Contact`,
                  title: "Team Member",
                  company: formattedCompanyName,
                  email: `contact@${domain}`,
                  phone: contactPhones[0],
                  linkedin:
                    contactLinkedin.length > 0 ? contactLinkedin[0] : "",
                  website: formattedUrl,
                  industry: detectIndustryFromURL(formattedUrl),
                  location: "Unknown",
                  confidenceScore: 65,
                });
              }

              setScrapedLeads(leads);
              setActiveTab("results");
              toast({
                title: "Contact page scraped",
                description: `Found ${leads.length} contacts from the contact page`,
              });
            } else {
              toast({
                variant: "destructive",
                title: "No contacts found",
                description:
                  "Could not extract any contact information from this website.",
              });
            }
          } else {
            toast({
              variant: "destructive",
              title: "No contacts found",
              description: "Could not find any contact pages on this website.",
            });
          }
        } catch (mapError) {
          console.error("Error mapping website:", mapError);
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
        <h3 className="text-xl font-bold">FireCrawl Web Scraper</h3>
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          Advanced Scraping
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          {scrapedLeads.length > 0 && (
            <TabsTrigger value="results">Results</TabsTrigger>
          )}
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
                <li>FireCrawl will automatically search for contact pages</li>
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
                <li>
                  FireCrawl can extract contact details from LinkedIn profiles
                </li>
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
                  FireCrawl can extract emails and phone numbers from social
                  profiles
                </li>
                <li>
                  Professional accounts typically have more contact details
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {scrapedLeads.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {scrapedLeads.length} contacts found
                </span>
                <Button size="sm" onClick={() => onLeadsFound(scrapedLeads)}>
                  Add to Lead Finder
                </Button>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Company</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">Phone</th>
                      <th className="p-3 text-left font-medium">LinkedIn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scrapedLeads.map((lead, index) => (
                      <tr key={index} className="border-t hover:bg-muted/20">
                        <td className="p-3 font-medium">{lead.name}</td>
                        <td className="p-3">{lead.company}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{lead.email}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{lead.phone}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {lead.linkedin ? (
                            <div className="flex items-center gap-1">
                              <Link className="h-3 w-3 text-muted-foreground" />
                              <a
                                href={lead.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Profile
                              </a>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No contacts found</h3>
              <p className="text-muted-foreground mb-4">
                Try another URL or website to find contacts
              </p>
              <Button onClick={() => setActiveTab("website")}>
                Try Another URL
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
