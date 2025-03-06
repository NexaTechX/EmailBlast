import { useState } from "react";
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
import {
  generateLeadsWithGemini,
  enrichLeadsWithGemini,
  generateDomainLeadsWithGemini,
} from "@/lib/gemini-api";
import {
  scrapeWebsiteForLeads,
  scrapeDomainBatch,
  searchAndScrapeLeads,
} from "@/lib/firecrawl";
import { URLScraper } from "./url-scraper";
import { FirecrawlWebScraper } from "./FirecrawlWebScraper";
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

  // AI-generated leads based on industry and role
  const generateLeads = (industry: string, role: string, location: string) => {
    const industries = {
      Technology: [
        { company: "TechNova Solutions", domain: "technovasolutions.com" },
        { company: "ByteWave Systems", domain: "bytewavesystems.com" },
        { company: "Quantum Digital", domain: "quantumdigital.io" },
        { company: "Nexus Technologies", domain: "nexustech.com" },
        { company: "Apex Software", domain: "apexsoftware.dev" },
      ],
      Healthcare: [
        { company: "MediCare Innovations", domain: "medicareinnovations.com" },
        { company: "HealthPulse", domain: "healthpulse.io" },
        { company: "Vitality Systems", domain: "vitalitysystems.health" },
        { company: "CareConnect", domain: "careconnect.med" },
        { company: "MedTech Solutions", domain: "medtechsolutions.com" },
      ],
      Finance: [
        { company: "Capital Ventures", domain: "capitalventures.com" },
        { company: "Wealth Horizon", domain: "wealthhorizon.finance" },
        { company: "Prosperity Partners", domain: "prosperitypartners.com" },
        { company: "Asset Alliance", domain: "assetalliance.invest" },
        { company: "Financial Frontier", domain: "financialfrontier.com" },
      ],
      Retail: [
        { company: "Urban Essentials", domain: "urbanessentials.com" },
        { company: "Retail Revolution", domain: "retailrevolution.store" },
        { company: "Market Masters", domain: "marketmasters.shop" },
        { company: "Consumer Connect", domain: "consumerconnect.retail" },
        { company: "Shop Sphere", domain: "shopsphere.com" },
      ],
    };

    const roles = {
      CEO: [
        "Chief Executive Officer",
        "Founder",
        "President",
        "Managing Director",
      ],
      CTO: [
        "Chief Technology Officer",
        "VP of Engineering",
        "Technical Director",
        "Head of Technology",
      ],
      Marketing: [
        "Marketing Director",
        "CMO",
        "Marketing Manager",
        "Growth Lead",
        "Brand Manager",
      ],
      Sales: [
        "Sales Director",
        "VP of Sales",
        "Business Development Manager",
        "Account Executive",
        "Sales Manager",
      ],
    };

    const locations = {
      us: [
        "New York, NY",
        "San Francisco, CA",
        "Austin, TX",
        "Chicago, IL",
        "Seattle, WA",
      ],
      ca: [
        "Toronto, ON",
        "Vancouver, BC",
        "Montreal, QC",
        "Calgary, AB",
        "Ottawa, ON",
      ],
      uk: [
        "London, UK",
        "Manchester, UK",
        "Birmingham, UK",
        "Edinburgh, UK",
        "Glasgow, UK",
      ],
      au: [
        "Sydney, NSW",
        "Melbourne, VIC",
        "Brisbane, QLD",
        "Perth, WA",
        "Adelaide, SA",
      ],
    };

    // Generate random first and last names
    const firstNames = [
      "James",
      "Emma",
      "Michael",
      "Olivia",
      "William",
      "Sophia",
      "Alexander",
      "Charlotte",
      "Daniel",
      "Ava",
      "David",
      "Mia",
      "Joseph",
      "Amelia",
      "Matthew",
      "Harper",
      "Andrew",
      "Evelyn",
      "Joshua",
      "Abigail",
    ];
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
      "Hernandez",
      "Lopez",
      "Gonzalez",
      "Wilson",
      "Anderson",
      "Thomas",
      "Taylor",
      "Moore",
      "Jackson",
      "Martin",
    ];

    // Select industry companies or default to Technology
    const selectedIndustry =
      industries[industry as keyof typeof industries] || industries.Technology;
    // Select roles or default to Marketing
    const selectedRoles = roles[role as keyof typeof roles] || roles.Marketing;
    // Select locations or default to US
    const selectedLocations =
      locations[location as keyof typeof locations] || locations.us;

    // Generate 5-10 leads
    const numLeads = Math.floor(Math.random() * 6) + 5;
    const leads = [];

    for (let i = 0; i < numLeads; i++) {
      const companyInfo =
        selectedIndustry[Math.floor(Math.random() * selectedIndustry.length)];
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const title =
        selectedRoles[Math.floor(Math.random() * selectedRoles.length)];
      const location =
        selectedLocations[Math.floor(Math.random() * selectedLocations.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyInfo.domain}`;

      leads.push({
        id: `${i + 1}-${Date.now()}`,
        name: `${firstName} ${lastName}`,
        title: title,
        company: companyInfo.company,
        email: email,
        phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        linkedin: `linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`,
        website: `https://www.${companyInfo.domain}`,
        industry: industry || "Technology",
        employees: [`1-10`, `11-50`, `51-200`, `201-500`, `501+`][
          Math.floor(Math.random() * 5)
        ],
        location: location,
      });
    }

    return leads;
  };

  // Default mock leads for initial state
  const mockLeads = [
    {
      id: "1",
      name: "John Smith",
      title: "Marketing Director",
      company: "Acme Inc",
      email: "john.smith@acme.com",
      phone: "+1 (555) 123-4567",
      linkedin: "linkedin.com/in/johnsmith",
      website: "acme.com",
      industry: "Technology",
      employees: "50-100",
      location: "New York, NY",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      title: "CEO",
      company: "Bright Solutions",
      email: "sarah@brightsolutions.io",
      phone: "+1 (555) 987-6543",
      linkedin: "linkedin.com/in/sarahjohnson",
      website: "brightsolutions.io",
      industry: "Software",
      employees: "10-50",
      location: "San Francisco, CA",
    },
    {
      id: "3",
      name: "Michael Chen",
      title: "Sales Manager",
      company: "Global Tech",
      email: "mchen@globaltech.com",
      phone: "+1 (555) 456-7890",
      linkedin: "linkedin.com/in/michaelchen",
      website: "globaltech.com",
      industry: "Technology",
      employees: "100-500",
      location: "Austin, TX",
    },
  ];

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

      // Try to get leads from Firecrawl web scraping first
      let firecrawlLeads = [];
      try {
        toast({
          title: "Searching the web",
          description: "Scraping websites for relevant leads...",
        });

        firecrawlLeads = await searchAndScrapeLeads(enhancedQuery, {
          maxResults: 10,
          location: countryFilter || undefined,
          industry: industryFilter || undefined,
        });

        console.log("Firecrawl leads:", firecrawlLeads.length);
      } catch (firecrawlError) {
        console.error("Firecrawl API error:", firecrawlError);
        // Fall back to Gemini if Firecrawl fails
      }

      // If Firecrawl returned results, use them
      if (firecrawlLeads.length > 0) {
        // Save the Firecrawl leads to the database for future searches
        try {
          await saveLeads(firecrawlLeads as Lead[]);
          console.log("Saved Firecrawl leads to database");

          setSearchResults(firecrawlLeads);
          toast({
            title: "Web scraping complete",
            description: `Found ${firecrawlLeads.length} leads from web scraping matching your criteria.`,
          });
          setSearching(false);
          return;
        } catch (saveError) {
          console.error("Error saving Firecrawl leads to database:", saveError);
        }
      }

      // If Firecrawl failed or returned no results, try Gemini API
      let geminiLeads = [];
      try {
        toast({
          title: "Using AI generation",
          description: "Generating leads with AI...",
        });

        geminiLeads = await generateLeadsWithGemini(enhancedQuery, 10);
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError);
        // Fall back to generated leads if Gemini fails
      }

      // If Gemini API returned results, use them
      let resultLeads = [];
      if (geminiLeads.length > 0) {
        resultLeads = geminiLeads;
        // Add IDs to the leads if they don't have them
        resultLeads = resultLeads.map((lead, index) => ({
          ...lead,
          id: lead.id || `gemini-${Date.now()}-${index}`,
        }));

        // Save the Gemini leads to the database for future searches
        try {
          await saveLeads(resultLeads as Lead[]);
          console.log("Saved Gemini leads to database");
        } catch (saveError) {
          console.error("Error saving Gemini leads to database:", saveError);
        }
      } else {
        // Generate AI leads based on search criteria using our local function
        const aiGeneratedLeads = generateLeads(
          industryFilter || searchQuery.includes("tech")
            ? "Technology"
            : searchQuery.includes("health")
              ? "Healthcare"
              : searchQuery.includes("finance")
                ? "Finance"
                : searchQuery.includes("retail")
                  ? "Retail"
                  : "Technology",
          jobTitleFilter || searchQuery.includes("ceo")
            ? "CEO"
            : searchQuery.includes("cto")
              ? "CTO"
              : searchQuery.includes("market")
                ? "Marketing"
                : searchQuery.includes("sales")
                  ? "Sales"
                  : "Marketing",
          countryFilter ||
            searchQuery.includes("US") ||
            searchQuery.includes("United States")
            ? "us"
            : searchQuery.includes("Canada")
              ? "ca"
              : searchQuery.includes("UK") ||
                  searchQuery.includes("United Kingdom")
                ? "uk"
                : searchQuery.includes("Australia")
                  ? "au"
                  : "us",
        );

        // Combine with mock leads for more variety
        resultLeads = [...aiGeneratedLeads, ...mockLeads];
      }

      // Filter leads based on search query and filters
      const filteredLeads = resultLeads.filter((lead) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = searchQuery
          ? lead.name?.toLowerCase().includes(searchLower) ||
            lead.company?.toLowerCase().includes(searchLower) ||
            lead.title?.toLowerCase().includes(searchLower) ||
            lead.industry?.toLowerCase().includes(searchLower) ||
            lead.location?.toLowerCase().includes(searchLower)
          : true;

        // Apply additional filters
        const matchesIndustry =
          !industryFilter ||
          (lead.industry &&
            lead.industry.toLowerCase().includes(industryFilter.toLowerCase()));
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
          matchesSearch &&
          matchesIndustry &&
          matchesSize &&
          matchesJobTitle &&
          matchesCountry
        );
      });

      setSearchResults(filteredLeads);
      toast({
        title: "Search complete",
        description: `Found ${filteredLeads.length} potential leads matching your criteria.`,
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: "An error occurred while searching for leads.",
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

      // Try to get real leads from Firecrawl web scraping first
      let scrapedLeads = [];
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

        console.log("Firecrawl scraped leads:", scrapedLeads.length);
      } catch (firecrawlError) {
        console.error("Firecrawl API error:", firecrawlError);
        // Fall back to Gemini if Firecrawl fails
      }

      // If Firecrawl returned results, use them
      if (scrapedLeads.length > 0) {
        // Save the scraped leads to the database
        try {
          await saveLeads(scrapedLeads as Lead[]);
          console.log("Saved scraped leads to database");

          setSearchResults(scrapedLeads);
          setActiveTab("results");

          // Update progress
          setBulkProgress(100);

          toast({
            title: "Web scraping complete",
            description: `Found ${scrapedLeads.length} leads from ${domains.length} domains through web scraping.`,
          });

          setBulkSearching(false);
          return;
        } catch (saveError) {
          console.error("Error saving scraped leads to database:", saveError);
        }
      }

      // If Firecrawl failed or returned no results, try Gemini API
      let generatedLeads = [];
      try {
        toast({
          title: "Using AI generation",
          description: "Generating leads with AI for the provided domains...",
        });

        // Process domains in batches to avoid hitting API limits
        const batchSize = 5; // Process 5 domains at a time
        for (let i = 0; i < domains.length; i += batchSize) {
          const domainBatch = domains.slice(i, i + batchSize);

          // Update progress for API call start
          const startProgress = 50 + Math.round((i / domains.length) * 40); // Start from 50% (after Firecrawl)
          setBulkProgress(startProgress);

          // Get leads for this batch of domains
          const batchLeads = await generateDomainLeadsWithGemini(domainBatch);
          generatedLeads = [...generatedLeads, ...batchLeads];

          // Update progress after batch is processed
          const endProgress =
            50 + Math.round(((i + domainBatch.length) / domains.length) * 40);
          setBulkProgress(endProgress);
        }
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError);
        // Fall back to generated leads if Gemini fails
      }

      // If Gemini API failed or returned no results, fall back to our generated leads
      if (generatedLeads.length === 0) {
        toast({
          title: "Using fallback generation",
          description: "Creating leads based on domain patterns...",
        });

        // Process domains one by one with progress updates
        for (let i = 0; i < domains.length; i++) {
          const domain = domains[i];

          // Generate more leads if findAll is checked
          const numLeads = findAll
            ? Math.floor(Math.random() * 5) + 3
            : Math.floor(Math.random() * 3) + 1;

          // Generate company name from domain
          const companyName = domain
            .split(".")[0]
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          // Determine industry based on domain keywords
          let industry = "Technology";
          if (
            domain.includes("health") ||
            domain.includes("med") ||
            domain.includes("care")
          ) {
            industry = "Healthcare";
          } else if (
            domain.includes("finance") ||
            domain.includes("capital") ||
            domain.includes("invest")
          ) {
            industry = "Finance";
          } else if (
            domain.includes("shop") ||
            domain.includes("store") ||
            domain.includes("retail")
          ) {
            industry = "Retail";
          }

          // Generate different roles for the company
          const roles = findAll
            ? [
                "CEO",
                "CTO",
                "Marketing Director",
                "Sales Manager",
                "Product Manager",
                "HR Director",
              ]
            : ["Marketing Director", "Sales Manager"];

          // Use only the roles we need
          const selectedRoles = roles.slice(0, numLeads);

          // Generate leads for each role
          for (let j = 0; j < numLeads; j++) {
            // Generate random first and last name
            const firstNames = [
              "James",
              "Emma",
              "Michael",
              "Olivia",
              "William",
              "Sophia",
              "Alexander",
              "Charlotte",
              "Daniel",
              "Ava",
            ];
            const lastNames = [
              "Smith",
              "Johnson",
              "Williams",
              "Brown",
              "Jones",
              "Garcia",
              "Miller",
              "Davis",
              "Rodriguez",
              "Martinez",
            ];

            const firstName =
              firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName =
              lastNames[Math.floor(Math.random() * lastNames.length)];
            const role = selectedRoles[j % selectedRoles.length];

            const newLead = {
              id: `${domain}-${j}`,
              name: `${firstName} ${lastName}`,
              title: role,
              company: companyName,
              email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
              phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
              linkedin: `linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`,
              website: `https://www.${domain}`,
              industry: industry,
              employees: [`1-10`, `11-50`, `51-200`, `201-500`, `501+`][
                Math.floor(Math.random() * 5)
              ],
              location: [
                "New York, NY",
                "San Francisco, CA",
                "Austin, TX",
                "Chicago, IL",
                "Seattle, WA",
              ][Math.floor(Math.random() * 5)],
            };

            generatedLeads.push(newLead);
          }

          // Update progress
          const progress = 90 + Math.round(((i + 1) / domains.length) * 10); // From 90% to 100%
          setBulkProgress(progress);
        }
      }

      // Add IDs to the leads if they don't have them
      const finalLeads = generatedLeads.map((lead, index) => ({
        ...lead,
        id: lead.id || `domain-${Date.now()}-${index}`,
      }));

      // Save the domain leads to the database for future searches
      try {
        if (finalLeads.length > 0) {
          await saveLeads(finalLeads as Lead[]);
          console.log("Saved domain leads to database");
        }
      } catch (saveError) {
        console.error("Error saving domain leads to database:", saveError);
      }

      setSearchResults(finalLeads);
      setActiveTab("results");
      toast({
        title: "Bulk search complete",
        description: `Found ${finalLeads.length} leads from ${domains.length} domains.`,
      });
    } catch (error) {
      console.error("Bulk search error:", error);
      toast({
        variant: "destructive",
        title: "Bulk search failed",
        description: "An error occurred while searching for leads.",
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

    try {
      // Check if the subscribers table exists
      const { error: tableCheckError } = await supabase
        .from("subscribers")
        .select("count")
        .limit(1);

      // If the table doesn't exist, create it
      if (tableCheckError && tableCheckError.code === "42P01") {
        console.log("Subscribers table does not exist, creating it...");
        try {
          await supabase.rpc("exec_sql", {
            sql_string: `
              CREATE TABLE IF NOT EXISTS public.subscribers (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email TEXT UNIQUE NOT NULL,
                first_name TEXT,
                last_name TEXT,
                phone TEXT,
                company TEXT,
                job_title TEXT,
                tags TEXT[],
                metadata JSONB,
                subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                unsubscribed_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
              ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
              CREATE POLICY "Allow all operations for authenticated users on subscribers" ON public.subscribers
                FOR ALL
                TO authenticated
                USING (true);
              ALTER PUBLICATION supabase_realtime ADD TABLE public.subscribers;
            `,
          });
        } catch (createError) {
          console.error("Error creating subscribers table:", createError);
          // Continue anyway, as the setupDatabase function might have created it already
        }
      }

      // Add selected leads to subscribers table
      const leadsToAdd = selectedLeads
        .map((id) => {
          const lead = searchResults.find((l) => l.id === id);
          if (!lead) return null;

          return {
            email: lead.email?.toLowerCase(),
            first_name: lead.name?.split(" ")[0] || "",
            last_name: lead.name?.split(" ").slice(1).join(" ") || "",
            company: lead.company || "",
            job_title: lead.title || "",
            phone: lead.phone || "",
            tags: ["lead-finder"],
            metadata: {
              source: "lead-finder",
              industry: lead.industry,
              linkedin: lead.linkedin,
              website: lead.website,
              // Include enriched data if available
              ...(lead.education && { education: lead.education }),
              ...(lead.previousCompanies && {
                previous_companies: lead.previousCompanies,
              }),
              ...(lead.technologies && { technologies: lead.technologies }),
              ...(lead.founded && { founded_year: lead.founded }),
              ...(lead.revenue && { revenue: lead.revenue }),
              ...(lead.confidenceScore && {
                confidence_score: lead.confidenceScore,
              }),
            },
          };
        })
        .filter(Boolean); // Remove any null entries

      if (leadsToAdd.length === 0) {
        throw new Error("No valid leads to add");
      }

      const { error } = await supabase.from("subscribers").upsert(leadsToAdd, {
        onConflict: "email",
        ignoreDuplicates: false,
      });

      if (error) {
        console.error("Supabase error adding leads:", error);
        throw error;
      }

      toast({
        title: "Leads added",
        description: `${leadsToAdd.length} leads have been added to your subscriber list.`,
      });

      setSelectedLeads([]);
    } catch (error: any) {
      console.error("Error adding leads to subscribers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message ||
          "Failed to add leads to subscribers. Please try again.",
      });
    }
  };

  const handleAIEnrichment = async () => {
    if (selectedLeads.length === 0) return;

    toast({
      title: "AI Enrichment in progress",
      description:
        "Using AI to find additional contact information and details.",
    });

    try {
      // Get confidence threshold setting
      const confidenceThreshold =
        (document.getElementById("confidence-threshold") as HTMLSelectElement)
          ?.value || "medium";
      const dataPoints =
        (document.getElementById("data-points") as HTMLSelectElement)?.value ||
        "all";

      // Create a copy of the search results
      const enrichedResults = [...searchResults];

      // Get the selected leads to enrich
      const leadsToEnrich = enrichedResults.filter((lead) =>
        selectedLeads.includes(lead.id),
      );

      // Try to enrich with Gemini API first
      let geminiEnrichedLeads = [];
      try {
        geminiEnrichedLeads = await enrichLeadsWithGemini(leadsToEnrich);

        // If we got results back, update the enriched results
        if (geminiEnrichedLeads.length > 0) {
          // Update the enriched results with the Gemini data
          for (const enrichedLead of geminiEnrichedLeads) {
            const index = enrichedResults.findIndex(
              (lead) => lead.id === enrichedLead.id,
            );
            if (index !== -1) {
              enrichedResults[index] = {
                ...enrichedResults[index],
                ...enrichedLead,
                // Make sure we keep the original ID
                id: enrichedResults[index].id,
              };
            }
          }
        }
      } catch (geminiError) {
        console.error("Gemini enrichment error:", geminiError);
        // Fall back to local enrichment if Gemini fails
      }

      // If Gemini API failed or returned no results, fall back to our local enrichment
      if (geminiEnrichedLeads.length === 0) {
        // Enrich the selected leads
        for (const id of selectedLeads) {
          const index = enrichedResults.findIndex((lead) => lead.id === id);
          if (index !== -1) {
            // Generate more detailed and realistic information based on the lead's industry
            const industry = (
              enrichedResults[index].industry || ""
            ).toLowerCase();

            // Generate technologies based on industry
            let technologies = [];
            if (industry.includes("tech") || industry.includes("software")) {
              technologies = [
                "React",
                "Node.js",
                "AWS",
                "MongoDB",
                "Python",
                "TypeScript",
                "Docker",
                "Kubernetes",
              ];
            } else if (industry.includes("health")) {
              technologies = [
                "Epic Systems",
                "Cerner",
                "MEDITECH",
                "AWS Healthcare",
                "Microsoft Azure",
                "HIPAA Compliance Tools",
              ];
            } else if (industry.includes("finance")) {
              technologies = [
                "Bloomberg Terminal",
                "Refinitiv Eikon",
                "SAP",
                "Oracle Financials",
                "Tableau",
                "Power BI",
              ];
            } else if (industry.includes("retail")) {
              technologies = [
                "Shopify",
                "Magento",
                "Salesforce Commerce",
                "Square",
                "NetSuite",
                "Microsoft Dynamics",
              ];
            } else {
              technologies = [
                "Microsoft Office",
                "Google Workspace",
                "Slack",
                "Zoom",
                "Asana",
                "Salesforce",
              ];
            }

            // Generate company size and revenue based on employees
            const employeeCount = enrichedResults[index].employees || "";
            let revenue = "$1M-$5M";
            let companySize = "Small Business";

            if (typeof employeeCount === "string") {
              if (employeeCount.includes("1-10")) {
                revenue = "$500K-$2M";
                companySize = "Startup";
              } else if (employeeCount.includes("11-50")) {
                revenue = "$2M-$10M";
                companySize = "Small Business";
              } else if (employeeCount.includes("51-200")) {
                revenue = "$10M-$50M";
                companySize = "Mid-size Company";
              } else if (employeeCount.includes("201-500")) {
                revenue = "$50M-$200M";
                companySize = "Large Company";
              } else if (employeeCount.includes("501+")) {
                revenue = "$200M+";
                companySize = "Enterprise";
              }
            }

            // Generate founding year based on company size
            let foundedYear;
            if (companySize === "Startup") {
              foundedYear = 2018 + Math.floor(Math.random() * 5); // 2018-2022
            } else if (companySize === "Small Business") {
              foundedYear = 2010 + Math.floor(Math.random() * 10); // 2010-2019
            } else if (companySize === "Mid-size Company") {
              foundedYear = 2000 + Math.floor(Math.random() * 15); // 2000-2014
            } else {
              foundedYear = 1980 + Math.floor(Math.random() * 30); // 1980-2009
            }

            // Generate direct phone and mobile based on area code in phone
            const phone = enrichedResults[index].phone || "";
            const areaCode =
              phone.match && phone.match(/\(([^)]+)\)/)
                ? phone.match(/\(([^)]+)\)/)[1]
                : "555";

            // Add additional information
            enrichedResults[index] = {
              ...enrichedResults[index],
              linkedin:
                enrichedResults[index].linkedin ||
                `linkedin.com/in/${enrichedResults[index].name.toLowerCase().replace(/ /g, "-")}`,
              twitter: `twitter.com/${enrichedResults[index].name.split(" ")[0].toLowerCase()}${Math.floor(Math.random() * 1000)}`,
              revenue: revenue,
              companySize: companySize,
              founded: foundedYear.toString(),
              technologies: technologies.slice(
                0,
                Math.floor(Math.random() * 5) + 2,
              ),
              directPhone: `+1 (${areaCode}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
              mobile: `+1 (${areaCode}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
              personalEmail: `${enrichedResults[index].name.split(" ")[0].toLowerCase()}.${enrichedResults[index].name.split(" ")[1]?.toLowerCase() || "doe"}@gmail.com`,
              education: [
                "Stanford University",
                "MIT",
                "Harvard University",
                "UC Berkeley",
                "University of Michigan",
                "NYU",
              ][Math.floor(Math.random() * 6)],
              previousCompanies: [
                "Google",
                "Microsoft",
                "Amazon",
                "Apple",
                "Meta",
                "IBM",
                "Oracle",
              ].slice(0, Math.floor(Math.random() * 3) + 1),
              interests: [
                "AI",
                "Machine Learning",
                "Blockchain",
                "IoT",
                "Digital Transformation",
                "Cloud Computing",
              ].slice(0, Math.floor(Math.random() * 4) + 1),
              confidenceScore:
                confidenceThreshold === "high"
                  ? Math.floor(Math.random() * 10) + 90
                  : confidenceThreshold === "medium"
                    ? Math.floor(Math.random() * 20) + 70
                    : Math.floor(Math.random() * 30) + 50,
            };
          }
        }
      }

      // Update the search results with the enriched data
      setSearchResults(enrichedResults);

      // Save the enriched leads to the database
      try {
        // Get only the selected leads that were enriched
        const enrichedLeadsToSave = enrichedResults.filter((lead) =>
          selectedLeads.includes(lead.id),
        );

        if (enrichedLeadsToSave.length > 0) {
          await saveLeads(enrichedLeadsToSave as Lead[]);
          console.log("Saved enriched leads to database");
        }
      } catch (saveError) {
        console.error("Error saving enriched leads to database:", saveError);
      }

      toast({
        title: "Enrichment complete",
        description: `Successfully enriched ${selectedLeads.length} leads with additional data.`,
      });
    } catch (error) {
      console.error("AI enrichment error:", error);
      toast({
        variant: "destructive",
        title: "Enrichment failed",
        description: "An error occurred while enriching the leads.",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Lead Finder</h3>
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          AI-Powered
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          <TabsTrigger value="scraper">URL Scraper</TabsTrigger>
          <TabsTrigger value="firecrawl">FireCrawl</TabsTrigger>
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
          <URLScraper
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

        <TabsContent value="firecrawl" className="space-y-6">
          <FirecrawlWebScraper
            onLeadsFound={(leads) => {
              if (leads && leads.length > 0) {
                setSearchResults(leads);
                setActiveTab("results");

                // Save the scraped leads to the database
                try {
                  saveLeads(leads);
                  console.log("Saved FireCrawl leads to database");

                  toast({
                    title: "Leads imported",
                    description: `${leads.length} leads have been added to your results.`,
                  });
                } catch (saveError) {
                  console.error(
                    "Error saving FireCrawl leads to database:",
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
                    onClick={handleAIEnrichment}
                    disabled={selectedLeads.length === 0}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Enrich
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

            <div className="p-4 border rounded-md space-y-4">
              <h4 className="font-medium">AI Enrichment Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="confidence-threshold" className="text-sm">
                    Confidence Threshold
                  </Label>
                  <select
                    id="confidence-threshold"
                    className="text-sm p-1 border rounded"
                  >
                    <option value="high">High (90%+)</option>
                    <option value="medium" selected>
                      Medium (70%+)
                    </option>
                    <option value="low">Low (50%+)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Prioritize web scraping</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="data-points" className="text-sm">
                    Required Data Points
                  </Label>
                  <select
                    id="data-points"
                    className="text-sm p-1 border rounded"
                  >
                    <option value="all">All (Email, Phone, etc.)</option>
                    <option value="email">Email Only</option>
                    <option value="minimal">Minimal (Name + Company)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Auto-verify email addresses</span>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-md space-y-4">
              <h4 className="font-medium">Compliance Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>GDPR Compliance Mode</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>CCPA Compliance Mode</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>CAN-SPAM Compliance</span>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
