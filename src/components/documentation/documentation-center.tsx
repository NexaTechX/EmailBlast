import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Book,
  FileText,
  Video,
  ExternalLink,
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
        <p>Welcome to EmailBlast! This guide will help you set up your account and send your first email campaign in just a few minutes.</p>
        
        <h2>Step 1: Set Up Your Account</h2>
        <p>After signing up, you'll need to complete your profile and verify your email domain to ensure high deliverability rates.</p>
        
        <h2>Step 2: Import Your Subscribers</h2>
        <p>You can import subscribers from a CSV file or add them manually. Make sure your list complies with anti-spam regulations.</p>
        
        <h2>Step 3: Create Your First Campaign</h2>
        <p>Use our drag-and-drop editor to create beautiful, responsive emails without any coding knowledge.</p>
        
        <h2>Step 4: Test and Send</h2>
        <p>Always send a test email to yourself before sending to your subscribers. Once you're satisfied, schedule or send your campaign.</p>
        
        <h2>Step 5: Analyze Results</h2>
        <p>After sending, track opens, clicks, and conversions in the Analytics dashboard to measure your campaign's success.</p>
      `,
    },
    {
      id: "email-templates",
      title: "Working with Email Templates",
      category: "guides",
      excerpt: "Learn how to create, edit, and save reusable email templates.",
      content: `
        <h1>Working with Email Templates</h1>
        <p>Email templates save you time and ensure consistent branding across all your campaigns.</p>
        
        <h2>Creating a New Template</h2>
        <p>You can create a template from scratch using our visual editor or start with one of our pre-designed templates.</p>
        
        <h2>Saving and Organizing Templates</h2>
        <p>Templates can be saved in folders and categorized for easy access. You can also mark templates as favorites.</p>
        
        <h2>Dynamic Content in Templates</h2>
        <p>Use merge tags to personalize your emails with subscriber data like names, company information, or custom fields.</p>
        
        <h2>Responsive Design</h2>
        <p>All templates are automatically responsive, but you can preview and adjust how they look on different devices.</p>
      `,
    },
    {
      id: "deliverability",
      title: "Improving Email Deliverability",
      category: "guides",
      excerpt: "Tips and best practices to ensure your emails reach the inbox.",
      content: `
        <h1>Improving Email Deliverability</h1>
        <p>Email deliverability is crucial for campaign success. Follow these best practices to maximize inbox placement.</p>
        
        <h2>Authentication Setup</h2>
        <p>Configure SPF, DKIM, and DMARC records for your sending domain to verify your identity to email providers.</p>
        
        <h2>List Hygiene</h2>
        <p>Regularly clean your list by removing inactive subscribers and bounced emails to maintain a good sender reputation.</p>
        
        <h2>Content Best Practices</h2>
        <p>Avoid spam trigger words, maintain a good text-to-image ratio, and include a clear unsubscribe link in every email.</p>
        
        <h2>Sending Practices</h2>
        <p>Warm up new sending domains gradually, maintain consistent sending volumes, and segment your list for more targeted content.</p>
      `,
    },
    {
      id: "api-overview",
      title: "API Documentation Overview",
      category: "api",
      excerpt: "Introduction to the EmailBlast API and available endpoints.",
      content: `
        <h1>API Documentation Overview</h1>
        <p>The EmailBlast API allows you to integrate our email marketing capabilities into your own applications.</p>
        
        <h2>Authentication</h2>
        <p>All API requests require an API key which you can generate in your account settings. Include this key in the Authorization header.</p>
        
        <h2>Rate Limits</h2>
        <p>The API has rate limits based on your plan. Check the response headers for your current usage and limits.</p>
        
        <h2>Core Endpoints</h2>
        <p>The API provides endpoints for managing subscribers, campaigns, templates, and analytics data.</p>
        
        <h2>Webhooks</h2>
        <p>Set up webhooks to receive real-time notifications about email events like opens, clicks, and bounces.</p>
        
        <h2>SDKs and Libraries</h2>
        <p>We provide official SDKs for popular programming languages including JavaScript, Python, PHP, and Ruby.</p>
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
          {activeArticle ? (
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setActiveArticle(null)}
                className="mb-2"
              >
                ← Back to Documentation
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
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles
                  .filter((article) => article.category === "api")
                  .map((article) => (
                    <Card
                      key={article.id}
                      className="p-4 border cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setActiveArticle(article.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Book className="h-5 w-5 text-primary" />
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

              <Card className="p-4 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Book className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Full API Reference</h4>
                      <p className="text-sm text-muted-foreground">
                        Complete documentation of all API endpoints and
                        parameters
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-4">
                <h4 className="font-medium">Getting Started Tutorial</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  A complete walkthrough of setting up your account and sending
                  your first campaign
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">5:32</Badge>
                  <span className="text-xs text-muted-foreground">
                    Updated 2 weeks ago
                  </span>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-4">
                <h4 className="font-medium">
                  Advanced Segmentation Strategies
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Learn how to create targeted segments for better campaign
                  performance
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">8:45</Badge>
                  <span className="text-xs text-muted-foreground">
                    Updated 1 month ago
                  </span>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-4">
                <h4 className="font-medium">A/B Testing Masterclass</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  How to set up effective A/B tests to optimize your email
                  campaigns
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">12:20</Badge>
                  <span className="text-xs text-muted-foreground">
                    Updated 3 weeks ago
                  </span>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-4">
                <h4 className="font-medium">API Integration Examples</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Code examples for integrating EmailBlast with your
                  applications
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">15:08</Badge>
                  <span className="text-xs text-muted-foreground">
                    Updated 2 months ago
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-center mt-4">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Tutorials
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
