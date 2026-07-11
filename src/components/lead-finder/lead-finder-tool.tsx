import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { saveLeads, getLeads, searchLeads, Lead } from "./lead-database";
import { ensureDefaultSubscriberList } from "@/lib/api";
import { formatLeads } from "@/lib/groq-api";
import {
  scrapeDomainBatch,
  searchAndScrapeLeads,
} from "@/lib/firecrawl";
import { assertCanAddSubscribers } from "@/lib/quota";
import { WebScraper } from "./web-scraper";
import {
  Search,
  Building,
  Users,
  Mail,
  Phone,
  Globe,
  Download,
  RefreshCw,
  Plus,
  Check,
  Sparkles,
} from "lucide-react";

export function LeadFinderTool() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("search");
  const [domainList, setDomainList] = useState("");
  const [bulkSearching, setBulkSearching] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    getLeads().then(({ leads }) => {
      if (leads.length > 0) setSearchResults(leads);
    });
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;

    setSearching(true);
    try {
      // Get filter values
      const industryFilter =
        (document.getElementById("industry") as HTMLSelectElement)?.value || "";
      const sizeFilter =
        (document.getElementById("size") as HTMLSelectElement)?.value || "";
      const jobTitleFilter =
        (document.getElementById("job-title") as HTMLSelectElement)?.value ||
        "";
      const seniorityFilter =
        (document.getElementById("seniority") as HTMLSelectElement)?.value ||
        "";
      const countryFilter =
        (document.getElementById("country") as HTMLSelectElement)?.value || "";
      const regionFilter =
        (document.getElementById("region") as HTMLSelectElement)?.value || "";

      // First, try to search in the database
      const { leads: databaseLeads } = await searchLeads(searchQuery);

      // If we have results from the database, use them
      if (databaseLeads.length > 0) {
        console.log("Found leads in database:", databaseLeads.length);

        // Filter the database leads based on the filters
        const filteredDatabaseLeads = databaseLeads.filter((lead) => {
          // Apply additional filters
          const matchesIndustry =
            !industryFilter ||
            (lead.industry &&
              lead.industry
                .toLowerCase()
                .includes(industryFilter.toLowerCase()));
          const matchesSize =
            !sizeFilter ||
            (lead.employees &&
              (typeof lead.employees === "string"
                ? lead.employees.includes(sizeFilter)
                : String(lead.employees).includes(sizeFilter)));
          const matchesJobTitle =
            !jobTitleFilter ||
            (lead.title &&
              lead.title.toLowerCase().includes(jobTitleFilter.toLowerCase()));
          const matchesCountry =
            !countryFilter ||
            (lead.location &&
              lead.location.includes(
                countryFilter === "us"
                  ? "US"
                  : countryFilter === "ca"
                    ? "Canada"
                    : countryFilter === "uk"
                      ? "UK"
                      : countryFilter === "au"
                        ? "Australia"
                        : "",
              ));

          return (
            matchesIndustry && matchesSize && matchesJobTitle && matchesCountry
          );
        });

        if (filteredDatabaseLeads.length > 0) {
          setSearchResults(filteredDatabaseLeads);
          toast({
            title: "Search complete",
            description: `Found ${filteredDatabaseLeads.length} leads in database matching your criteria.`,
          });
          setSearching(false);
          return;
        }
      }

      // Build search query with filters
      let enhancedQuery = searchQuery;
      if (industryFilter) enhancedQuery += ` in ${industryFilter} industry`;
      if (jobTitleFilter) enhancedQuery += ` with ${jobTitleFilter} title`;
      if (countryFilter)
        enhancedQuery += ` in ${
          countryFilter === "us"
            ? "United States"
            : countryFilter === "ca"
              ? "Canada"
              : countryFilter === "uk"
                ? "United Kingdom"
                : countryFilter === "au"
                  ? "Australia"
                  : countryFilter
        }`;
      if (regionFilter) enhancedQuery += ` in ${regionFilter}`;
      if (sizeFilter) enhancedQuery += ` at ${sizeFilter} employee companies`;

      // Try web scraping first
      let webLeads: Lead[] = [];
      try {
        toast({
          title: "Searching the web",
          description: "Scraping websites for relevant leads...",
        });

        webLeads = await searchAndScrapeLeads(enhancedQuery, {
          maxResults: 10,
          location: countryFilter || undefined,
          industry: industryFilter || undefined,
        });

        console.log("Web scrape leads:", webLeads.length);
      } catch (scrapeError) {
        console.error("Web scrape error:", scrapeError);
        toast({
          variant: "destructive",
          title: "Web scrape failed",
          description:
            scrapeError instanceof Error
              ? scrapeError.message
              : "Could not scrape leads.",
        });
      }

      if (webLeads.length > 0) {
        try {
          await saveLeads(webLeads);
          setSearchResults(webLeads);
          setActiveTab("results");
          toast({
            title: "Search complete",
            description: `Found ${webLeads.length} contacts from public pages via Firecrawl.`,
          });
          setSearching(false);
          return;
        } catch (saveError) {
          console.error("Error saving scraped leads to database:", saveError);
          setSearchResults(webLeads);
          setActiveTab("results");
        }
      }

      toast({
        variant: "destructive",
        title: "No contacts found",
        description:
          "Firecrawl did not find contact emails on matching pages. Try a different query or scrape a company domain.",
      });
      setSearchResults([]);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Search failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while searching for leads.",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleBulkSearch = async () => {
    if (!domainList) return;

    const domains = domainList.split("\n").filter((d) => d.trim());
    if (domains.length === 0) return;

    setBulkSearching(true);
    setBulkProgress(0);

    try {
      // Database tables should already be set up by setupDatabase in App.tsx

      // Get the find all contacts setting
      const findAll =
        (document.getElementById("find-all") as HTMLInputElement)?.checked ||
        false;

      // Try web scraping first
      let scrapedLeads: Lead[] = [];
      try {
        toast({
          title: "Scraping websites",
          description: "Extracting contact information from domain websites...",
        });

        // Format domains properly
        const formattedDomains = domains.map((domain) =>
          domain.startsWith("http") ? domain : `https://${domain}`,
        );

        // Update progress
        setBulkProgress(10);

        // Scrape the domains for leads
        scrapedLeads = await scrapeDomainBatch(formattedDomains);

        // Update progress
        setBulkProgress(50);

        console.log("Web scraped leads:", scrapedLeads.length);
      } catch (scrapeError) {
        console.error("Web scrape error:", scrapeError);
        toast({
          variant: "destructive",
          title: "Domain scrape failed",
          description:
            scrapeError instanceof Error
              ? scrapeError.message
              : "Could not scrape domains.",
        });
      }

      if (scrapedLeads.length > 0) {
        try {
          await saveLeads(scrapedLeads as Lead[]);
          setSearchResults(scrapedLeads);
          setActiveTab("results");
          setBulkProgress(100);
          toast({
            title: "Domain scrape complete",
            description: `Found ${scrapedLeads.length} contacts from ${domains.length} domain(s) via Firecrawl.`,
          });
          setBulkSearching(false);
          return;
        } catch (saveError) {
          console.error("Error saving scraped leads to database:", saveError);
          setSearchResults(scrapedLeads);
          setActiveTab("results");
        }
      }

      toast({
        variant: "destructive",
        title: "No contacts found",
        description:
          "No public contact emails were found on these domains. Try About/Contact/Team pages.",
      });
      setSearchResults([]);
      setBulkProgress(100);
    } catch (error) {
      console.error("Bulk search error:", error);
      toast({
        variant: "destructive",
        title: "Bulk search failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while searching for leads.",
      });
    } finally {
      setBulkSearching(false);
      setBulkProgress(100);
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id)
        ? prev.filter((leadId) => leadId !== id)
        : [...prev, id],
    );
  };

  const handleAddToList = async () => {
    if (selectedLeads.length === 0) return;

    const confirmed = confirm(
      "These contacts were scraped from public web pages (Firecrawl). Scraped ≠ opted-in. Only import if you have a lawful basis to email them. Continue?",
    );
    if (!confirmed) return;

    try {
      const defaultList = await ensureDefaultSubscriberList();
      if (!defaultList) throw new Error("No subscriber list available");

      const leadsToAdd = selectedLeads
        .map((id) => {
          const lead = searchResults.find((l) => l.id === id);
          if (!lead?.email) return null;

          return {
            email: lead.email.toLowerCase().trim(),
            list_id: defaultList.id,
            first_name: lead.name?.split(" ")[0] || "",
            last_name: lead.name?.split(" ").slice(1).join(" ") || "",
            tags: ["lead-finder"],
            metadata: {
              source: "lead-finder-firecrawl",
              company: lead.company || "",
              job_title: lead.title || "",
              phone: lead.phone || "",
              industry: lead.industry,
              linkedin: lead.linkedin,
              website: lead.website,
            },
          };
        })
        .filter(Boolean);

      if (leadsToAdd.length === 0) {
        throw new Error("No leads with email addresses selected");
      }

      await assertCanAddSubscribers(leadsToAdd.length);

      const { error } = await supabase.from("subscribers").upsert(leadsToAdd, {
        onConflict: "user_id,email",
        ignoreDuplicates: false,
      });

      if (error) throw error;

      try {
        const { enrollSubscribersInAutomations } = await import(
          "@/lib/automations"
        );
        await enrollSubscribersInAutomations(
          defaultList.id,
          leadsToAdd.map((l) => (l as { email: string }).email),
        );
      } catch (enrollErr) {
        console.warn("Automation enrollment skipped:", enrollErr);
      }

      toast({
        title: "Leads imported",
        description: `${leadsToAdd.length} contact(s) added to your list (duplicates updated).`,
      });

      setSelectedLeads([]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add leads to subscribers. Please try again.";
      console.error("Error adding leads to subscribers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  const handleFormatWithAI = async () => {
    if (selectedLeads.length === 0) return;

    toast({
      title: "Formatting with AI",
      description: "Cleaning scraped contact fields — no new contacts invented.",
    });

    try {
      const selected = searchResults.filter((l) =>
        selectedLeads.includes(l.id),
      );
      const allowed = new Set(
        selected.map((l) => l.email?.toLowerCase().trim()).filter(Boolean),
      );
      const sources = selected.map((lead) => ({
        sourceUrl: lead.website || lead.email || "scraped",
        markdown: [
          `name: ${lead.name || ""}`,
          `title: ${lead.title || ""}`,
          `company: ${lead.company || ""}`,
          `email: ${lead.email || ""}`,
          `phone: ${lead.phone || ""}`,
          `linkedin: ${lead.linkedin || ""}`,
          `website: ${lead.website || ""}`,
          `location: ${lead.location || ""}`,
          `industry: ${lead.industry || ""}`,
        ].join("\n"),
      }));

      const formatted = await formatLeads(sources);
      const safe = formatted.filter(
        (l) => l.email && allowed.has(l.email.toLowerCase().trim()),
      );
      if (safe.length === 0) {
        toast({
          variant: "destructive",
          title: "Nothing to format",
          description: "AI returned no safe updates for the selected contacts.",
        });
        return;
      }

      const next = searchResults.map((lead) => {
        const match = safe.find(
          (f) =>
            f.email?.toLowerCase() === lead.email?.toLowerCase() ||
            selectedLeads.includes(lead.id),
        );
        if (!match || !selectedLeads.includes(lead.id)) return lead;
        return {
          ...lead,
          name: match.name || lead.name,
          title: match.title || lead.title,
          company: match.company || lead.company,
          phone: match.phone || lead.phone,
          linkedin: match.linkedin || lead.linkedin,
        };
      });
      setSearchResults(next);
      await saveLeads(next.filter((l) => selectedLeads.includes(l.id)) as Lead[]);
      toast({
        title: "Format complete",
        description: `Cleaned ${safe.length} scraped contact(s).`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Format failed",
        description:
          error instanceof Error ? error.message : "Could not format leads.",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Lead Finder</h3>
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
          Beta — experimental
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          <TabsTrigger value="scraper">Web Scraper</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">
                Search by Company, Industry, or Location
              </Label>
              <div className="flex gap-2">
                <Input
                  id="search-query"
                  placeholder="e.g., tech companies in San Francisco"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery}
                >
                  {searching ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  {searching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Company Filters</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="industry" className="text-sm">
                      Industry
                    </Label>
                    <select
                      id="industry"
                      className="text-sm p-1 border rounded"
                    >
                      <option value="">Any</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="retail">Retail</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="size" className="text-sm">
                      Company Size
                    </Label>
                    <select id="size" className="text-sm p-1 border rounded">
                      <option value="">Any</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501+">501+ employees</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Contact Filters</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="job-title" className="text-sm">
                      Job Title
                    </Label>
                    <select
                      id="job-title"
                      className="text-sm p-1 border rounded"
                    >
                      <option value="">Any</option>
                      <option value="ceo">CEO</option>
                      <option value="cto">CTO</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Sales</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seniority" className="text-sm">
                      Seniority
                    </Label>
                    <select
                      id="seniority"
                      className="text-sm p-1 border rounded"
                    >
                      <option value="">Any</option>
                      <option value="c-level">C-Level</option>
                      <option value="vp">VP</option>
                      <option value="director">Director</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  <h4 className="font-medium">Location Filters</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="country" className="text-sm">
                      Country
                    </Label>
                    <select id="country" className="text-sm p-1 border rounded">
                      <option value="">Any</option>
                      <option value="us">United States</option>
                      <option value="ca">Canada</option>
                      <option value="uk">United Kingdom</option>
                      <option value="au">Australia</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="region" className="text-sm">
                      Region/State
                    </Label>
                    <select id="region" className="text-sm p-1 border rounded">
                      <option value="">Any</option>
                      <option value="ca">California</option>
                      <option value="ny">New York</option>
                      <option value="tx">Texas</option>
                      <option value="fl">Florida</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain-list">
                Enter Company Domains (one per line)
              </Label>
              <Textarea
                id="domain-list"
                placeholder="example.com\nanother-company.com\nthird-domain.co.uk"
                className="min-h-[200px]"
                value={domainList}
                onChange={(e) => setDomainList(e.target.value)}
              />
            </div>

            {bulkSearching && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing domains...</span>
                  <span>{bulkProgress}%</span>
                </div>
                <Progress value={bulkProgress} className="h-2" />
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Switch id="find-all" />
                <Label htmlFor="find-all" className="text-sm">
                  Find all contacts at each company
                </Label>
              </div>
              <Button
                onClick={handleBulkSearch}
                disabled={bulkSearching || !domainList.trim()}
              >
                {bulkSearching ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {bulkSearching ? "Processing..." : "Find Leads"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scraper" className="space-y-6">
          <WebScraper
            onLeadsFound={(leads) => {
              if (leads && leads.length > 0) {
                setSearchResults(leads);
                setActiveTab("results");

                // Save the scraped leads to the database
                try {
                  saveLeads(leads);
                  console.log("Saved scraped leads to database");

                  toast({
                    title: "Leads imported",
                    description: `${leads.length} leads have been added to your results.`,
                  });
                } catch (saveError) {
                  console.error(
                    "Error saving scraped leads to database:",
                    saveError,
                  );
                }
              }
            }}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {searchResults.length} leads found
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFormatWithAI}
                    disabled={selectedLeads.length === 0}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Format with AI
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedLeads.length === 0}
                    onClick={() => {
                      // Create CSV content
                      const selectedData = searchResults.filter((lead) =>
                        selectedLeads.includes(lead.id),
                      );
                      const headers = [
                        "Name",
                        "Company",
                        "Title",
                        "Email",
                        "Phone",
                        "LinkedIn",
                        "Website",
                        "Industry",
                        "Location",
                      ];
                      const csvContent = [
                        headers.join(","),
                        ...selectedData.map((lead) =>
                          [
                            `"${lead.name}"`,
                            `"${lead.company}"`,
                            `"${lead.title}"`,
                            lead.email,
                            `"${lead.phone}"`,
                            lead.linkedin,
                            lead.website,
                            `"${lead.industry}"`,
                            `"${lead.location}"`,
                          ].join(","),
                        ),
                      ].join("\n");

                      // Create download link
                      const blob = new Blob([csvContent], {
                        type: "text/csv;charset=utf-8;",
                      });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute(
                        "download",
                        `leads_export_${new Date().toISOString().split("T")[0]}.csv`,
                      );
                      link.style.visibility = "hidden";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      toast({
                        title: "Export complete",
                        description: `${selectedLeads.length} leads exported to CSV.`,
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddToList}
                    disabled={selectedLeads.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to List
                  </Button>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-medium">
                        <input
                          type="checkbox"
                          className="rounded"
                          onChange={() => {
                            if (selectedLeads.length === searchResults.length) {
                              setSelectedLeads([]);
                            } else {
                              setSelectedLeads(
                                searchResults.map((lead) => lead.id),
                              );
                            }
                          }}
                          checked={
                            selectedLeads.length === searchResults.length &&
                            searchResults.length > 0
                          }
                        />
                      </th>
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Company</th>
                      <th className="p-3 text-left font-medium">Title</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">Phone</th>
                      <th className="p-3 text-left font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((lead) => (
                      <tr key={lead.id} className="border-t hover:bg-muted/20">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => toggleSelectLead(lead.id)}
                          />
                        </td>
                        <td className="p-3 font-medium">
                          <div className="flex flex-col">
                            <span>{lead.name}</span>
                            {lead.education && (
                              <span className="text-xs text-muted-foreground">
                                {lead.education}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span>{lead.company}</span>
                            {lead.founded && (
                              <span className="text-xs text-muted-foreground">
                                Founded: {lead.founded}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span>{lead.title}</span>
                            {lead.previousCompanies &&
                              lead.previousCompanies.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  Ex: {lead.previousCompanies.join(", ")}
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{lead.email}</span>
                            </div>
                            {lead.personalEmail && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">
                                  {lead.personalEmail}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{lead.phone}</span>
                            </div>
                            {lead.directPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">
                                  Direct: {lead.directPhone}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span>{lead.location}</span>
                            {lead.confidenceScore && (
                              <span
                                className={`text-xs ${lead.confidenceScore >= 90 ? "text-green-600" : lead.confidenceScore >= 70 ? "text-amber-600" : "text-red-600"}`}
                              >
                                {lead.confidenceScore}% confidence
                              </span>
                            )}
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
              <h3 className="text-lg font-medium mb-2">No leads found yet</h3>
              <p className="text-muted-foreground mb-4">
                Use the search or bulk import tools to find potential leads
              </p>
              <Button onClick={() => setActiveTab("search")}>
                Start Searching
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-md space-y-4">
              <h4 className="font-medium">Data Sources</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Company Databases</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Professional Networks</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Public Directories</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Website Crawling</span>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-md space-y-3">
              <h4 className="font-medium">How Lead Finder works</h4>
              <p className="text-sm text-muted-foreground">
                Contacts come from public pages via Firecrawl (search, map,
                scrape). AI only formats scraped text — it never invents emails
                or people. Scraped contacts are not opted-in subscribers.
              </p>
            </div>

            <div className="p-4 border rounded-md space-y-4">
              <h4 className="font-medium">Compliance reminder</h4>
              <p className="text-sm text-muted-foreground">
                You are responsible for having a lawful basis before emailing
                scraped contacts. Prefer people who already opted in to your
                list.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
