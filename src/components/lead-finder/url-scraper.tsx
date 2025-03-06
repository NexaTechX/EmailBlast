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
import {
  extractContactsFromWebsite,
  extractContactsFromSocialMedia,
} from "@/lib/firecrawl-js";
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
} from "lucide-react";

export function URLScraper({ onLeadsFound = (leads: Lead[]) => {} }) {
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
    try {
      // Determine if this is a social media URL
      const isLinkedIn = url.includes("linkedin.com");
      const isTwitter = url.includes("twitter.com") || url.includes("x.com");
      const isFacebook = url.includes("facebook.com");
      const isInstagram = url.includes("instagram.com");
      const isSocialMedia =
        isLinkedIn || isTwitter || isFacebook || isInstagram;

      // Use the appropriate extraction method
      if (isSocialMedia) {
        return await extractContactsFromSocialMedia(url);
      } else {
        return await extractContactsFromWebsite(url);
      }
    } catch (error) {
      console.error("Error extracting contact info:", error);
      return [];
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
