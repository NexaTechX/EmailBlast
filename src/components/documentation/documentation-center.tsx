import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

export function DocumentationCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState<string | null>(null);

  const articles = [
    {
      id: "getting-started",
      title: "Getting Started with EmailBlast",
      category: "guides",
      excerpt: "Learn how to set up your account and send your first campaign.",
      content: `
        <h1>Getting Started with EmailBlast</h1>
        <p>Welcome to EmailBlast. This guide walks you through sending your first campaign.</p>
        
        <h2>Step 1: Complete sending settings</h2>
        <p>Add your sender name, reply-to email, and physical mailing address under Settings → Sending. EmailBlast sends on our verified domain — you do not need a Resend account or DNS records.</p>
        
        <h2>Step 2: Import subscribers</h2>
        <p>Create a list, then import from CSV or add contacts manually on the Subscribers page.</p>
        
        <h2>Step 3: Create a campaign</h2>
        <p>Use the rich text editor (or a starter template) to write your email. Optionally use the AI copy assistant.</p>
        
        <h2>Step 4: Test and send</h2>
        <p>Send a test email to yourself, then send or schedule the campaign to your list.</p>
        
        <h2>Step 5: Review analytics</h2>
        <p>Track opens, clicks, conversions (links with eb_convert=1), bounces, and unsubscribes in Analytics.</p>
      `,
    },
    {
      id: "email-templates",
      title: "Working with Email Templates",
      category: "guides",
      excerpt: "Use built-in starters or save your own templates.",
      content: `
        <h1>Working with Email Templates</h1>
        <p>Templates help you reuse layouts and keep campaigns consistent.</p>
        
        <h2>Built-in starters</h2>
        <p>Open Templates in the campaign editor to browse newsletter, promotional, transactional, and announcement starters.</p>
        
        <h2>Save your own</h2>
        <p>Click “Save as template” in the editor to store the current HTML. Saved templates appear under the Saved tab.</p>
        
        <h2>Apply a template</h2>
        <p>Selecting a template replaces the campaign body with that HTML. Edit freely afterward.</p>
      `,
    },
    {
      id: "deliverability",
      title: "Improving Email Deliverability",
      category: "guides",
      excerpt: "Tips to help your emails reach the inbox.",
      content: `
        <h1>Improving Email Deliverability</h1>
        <p>EmailBlast delivers campaigns through our verified Resend domain. Follow these basics to keep engagement healthy.</p>
        
        <h2>Sending domain</h2>
        <p>Domain authentication (SPF, DKIM, DMARC) is managed by EmailBlast. Set your display name and reply-to in Settings — replies go to your address even though mail sends from our domain.</p>
        
        <h2>Keep lists clean</h2>
        <p>Remove bounced and unsubscribed contacts. EmailBlast suppresses bounces and complaints automatically when webhooks are configured.</p>
        
        <h2>Include required footer content</h2>
        <p>Every send injects an unsubscribe link and your physical mailing address. Keep that address accurate in Settings.</p>
        
        <h2>Start small</h2>
        <p>Free beta limits are 200 subscribers and 100 emails per month. Warm up volume gradually as you grow.</p>
      `,
    },
    {
      id: "automations",
      title: "Welcome drip automations",
      category: "guides",
      excerpt: "Send delayed emails when someone joins a list.",
      content: `
        <h1>Welcome drip automations</h1>
        <p>Automations run when a subscriber is added to a chosen list.</p>
        
        <h2>Create a drip</h2>
        <p>Go to Automations, name the sequence, pick a list, and add up to five email steps with hour delays.</p>
        
        <h2>Activate</h2>
        <p>New and imported subscribers on that list enroll automatically while the automation is active. A cron job sends due steps every few minutes.</p>
        
        <h2>Requirements</h2>
        <p>You need sender details and a mailing address configured. Monthly send limits still apply.</p>
      `,
    },
    {
      id: "lead-finder",
      title: "Lead Finder (Firecrawl)",
      category: "guides",
      excerpt: "Find public contacts from websites — AI only formats scraped text.",
      content: `
        <h1>Lead Finder</h1>
        <p>Lead Finder uses Firecrawl to search and scrape public pages (About, Contact, Team). It does not invent contacts.</p>
        <h2>Search or domains</h2>
        <p>Use Search for a topic query, Domains for company websites, or Scraper for a single URL.</p>
        <h2>Format with AI</h2>
        <p>Optionally clean name/title fields from scraped text. AI never adds emails that were not found on the page.</p>
        <h2>Import carefully</h2>
        <p>Scraped ≠ opted-in. Only email people when you have a lawful basis.</p>
      `,
    },
    {
      id: "merge-tags",
      title: "Personalization merge tags",
      category: "guides",
      excerpt: "Use {{first_name}}, {{last_name}}, and {{email}} in campaigns.",
      content: `
        <h1>Merge tags</h1>
        <p>Insert personalization tags in the campaign editor toolbar.</p>
        <ul>
          <li><code>{{first_name}}</code> — falls back to “there” if empty</li>
          <li><code>{{last_name}}</code></li>
          <li><code>{{email}}</code></li>
        </ul>
        <p>Tags are replaced per recipient when sending campaigns, scheduled sends, and automation emails.</p>
        <p>Use Personalize in the editor to have AI place tags naturally in your copy.</p>
      `,
    },
  ];

  const filteredArticles = searchQuery
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : articles;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Documentation Center</h3>
          <p className="text-sm text-muted-foreground">
            Find help articles, tutorials, and API documentation
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="guides">
        <TabsList className="mb-6">
          <TabsTrigger value="guides">Guides & Tutorials</TabsTrigger>
          <TabsTrigger value="api">API Documentation</TabsTrigger>
          <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          {activeArticle ? (
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setActiveArticle(null)}
                className="mb-2"
              >
                ← Back to Articles
              </Button>
              <div className="prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      articles.find((a) => a.id === activeArticle)?.content ||
                      "",
                  }}
                />
              </div>
              <div className="border-t pt-4 mt-8">
                <p className="text-sm text-muted-foreground mb-2">
                  Was this article helpful?
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Yes
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    No
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles
                .filter((article) => article.category === "guides")
                .map((article) => (
                  <Card
                    key={article.id}
                    className="p-4 border cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setActiveArticle(article.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{article.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card className="p-6 border">
            <h4 className="font-medium">Public API — not available yet</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              EmailBlast does not currently offer customer API keys or a public
              REST API. Campaign sending, tracking, and AI features use internal
              authenticated endpoints only. We will document a public API when it
              ships.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card className="p-6 border">
            <h4 className="font-medium">Video tutorials — coming later</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              No video walkthroughs are published yet. Use the Guides tab for
              written setup help.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
