import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { scrapeWebsiteForLeads, scrapeUrlBatch } from "@/lib/firecrawl";
import { isValidScrapeUrl, leadsToCsv, normalizeUrl } from "@/lib/scrape-extract";
import { Lead } from "./lead-database";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  RefreshCw,
  Globe,
  Mail,
  Phone,
  Download,
} from "lucide-react";

export function WebScraper({
  onLeadsFound = (_leads: Lead[]) => {},
}: {
  onLeadsFound?: (leads: Lead[]) => void;
}) {
  const [url, setUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [deepScan, setDeepScan] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("single");
  const [scrapedLeads, setScrapedLeads] = useState<Lead[]>([]);
  const { toast } = useToast();

  const runScrape = async (target: string) => {
    const formattedUrl = normalizeUrl(target);
    if (!isValidScrapeUrl(formattedUrl)) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Enter a valid http(s) website URL.",
      });
      return;
    }

    setScraping(true);
    setProgress(20);

    try {
      const leads = await scrapeWebsiteForLeads(formattedUrl, {
        maxLeads: 10,
        depth: deepScan ? 2 : 1,
        deepScan,
      });

      setProgress(100);

      if (leads.length > 0) {
        setScrapedLeads(leads);
        onLeadsFound(leads);
        setActiveTab("results");
        toast({
          title: "Scan complete",
          description: `Found ${leads.length} contact(s) from ${formattedUrl}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "No contacts found",
          description:
            "Try a contact or about page URL, or enable deep scan to search the site.",
        });
      }
    } catch (error) {
      console.error("Scrape error:", error);
      const message =
        error instanceof Error ? error.message : "Could not scan this URL.";
      toast({
        variant: "destructive",
        title: "Scan failed",
        description: message,
      });
    } finally {
      setScraping(false);
    }
  };

  const handleSingleScrape = () => {
    if (!url.trim()) {
      toast({
        variant: "destructive",
        title: "URL required",
        description: "Enter a website URL to scan.",
      });
      return;
    }
    runScrape(url.trim());
  };

  const handleBulkScrape = async () => {
    const urls = bulkUrls
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean)
      .map(normalizeUrl)
      .filter(isValidScrapeUrl);

    if (urls.length === 0) {
      toast({
        variant: "destructive",
        title: "No valid URLs",
        description: "Enter one URL per line or comma-separated.",
      });
      return;
    }

    setScraping(true);
    setProgress(10);

    try {
      const leads = await scrapeUrlBatch(urls, {
        maxLeads: 8,
        deepScan,
        depth: deepScan ? 2 : 1,
      });

      setProgress(100);

      if (leads.length > 0) {
        setScrapedLeads(leads);
        onLeadsFound(leads);
        setActiveTab("results");
        toast({
          title: "Batch scan complete",
          description: `Found ${leads.length} contact(s) across ${urls.length} site(s).`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "No contacts found",
          description: "Try deep scan or paste direct contact/about page URLs.",
        });
      }
    } catch (error) {
      console.error("Bulk scrape error:", error);
      const message =
        error instanceof Error ? error.message : "Could not complete the scan.";
      toast({
        variant: "destructive",
        title: "Batch scan failed",
        description: message,
      });
    } finally {
      setScraping(false);
    }
  };

  const handleExportCsv = () => {
    if (scrapedLeads.length === 0) return;
    const blob = new Blob([leadsToCsv(scrapedLeads)], { type: "text/csv" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `web-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Extract emails and phone numbers from public company websites. Best
        results from homepages, contact, about, or team pages.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="single">Single URL</TabsTrigger>
          <TabsTrigger value="bulk">Multiple URLs</TabsTrigger>
          {scrapedLeads.length > 0 && (
            <TabsTrigger value="results">Results</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="single" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="website-url">Website URL</Label>
            <div className="flex gap-2">
              <Input
                id="website-url"
                placeholder="https://example.com/contact"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSingleScrape()}
              />
              <Button onClick={handleSingleScrape} disabled={scraping || !url}>
                {scraping ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <DeepScanToggle deepScan={deepScan} onChange={setDeepScan} />
          {scraping && <ProgressBar progress={progress} label="Scanning…" />}
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-urls">URLs (one per line)</Label>
            <Textarea
              id="bulk-urls"
              placeholder={"https://example.com\nhttps://acme.com/contact"}
              className="min-h-[120px] font-mono text-sm"
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
            />
          </div>
          <DeepScanToggle deepScan={deepScan} onChange={setDeepScan} />
          {scraping && <ProgressBar progress={progress} label="Scanning batch…" />}
          <Button
            onClick={handleBulkScrape}
            disabled={scraping || !bulkUrls.trim()}
            className="w-full"
          >
            {scraping ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Globe className="h-4 w-4 mr-2" />
            )}
            Scan all URLs
          </Button>
        </TabsContent>

        <TabsContent value="results" className="space-y-4 mt-4">
          {scrapedLeads.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {scrapedLeads.length} contact(s)
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleExportCsv}>
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                  <Button size="sm" onClick={() => onLeadsFound(scrapedLeads)}>
                    Add to results
                  </Button>
                </div>
              </div>
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Company</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scrapedLeads.map((lead) => (
                      <tr key={lead.id} className="border-t">
                        <td className="p-3">{lead.name}</td>
                        <td className="p-3">{lead.company}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {lead.email || "—"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {lead.phone || "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DeepScanToggle({
  deepScan,
  onChange,
}: {
  deepScan: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">Deep scan</p>
        <p className="text-xs text-muted-foreground">
          Discover and scan contact, about, and team pages on the site
        </p>
      </div>
      <Switch checked={deepScan} onCheckedChange={onChange} />
    </div>
  );
}

function ProgressBar({
  progress,
  label,
}: {
  progress: number;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

/** @deprecated Use WebScraper */