import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Search, Globe, ArrowUpRight, Check } from "lucide-react";

export function SEOOptimization() {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">Email SEO Optimization</h3>

      <Tabs defaultValue="content">
        <TabsList className="mb-6">
          <TabsTrigger value="content">Content Optimization</TabsTrigger>
          <TabsTrigger value="technical">Technical SEO</TabsTrigger>
          <TabsTrigger value="preview">Search Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Target Keywords</Label>
              <Input
                id="keywords"
                placeholder="Enter target keywords separated by commas"
              />
              <p className="text-sm text-muted-foreground mt-1">
                These keywords will be used to optimize your email content for
                better deliverability and search visibility.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea
                id="meta-description"
                placeholder="Enter a brief description of your email campaign"
                className="h-24"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This description may appear in search results and email
                previews.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch defaultChecked />
                AI Content Optimization
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically optimize your content for better engagement and
                deliverability.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Header Optimization</Label>
              <div className="p-4 border rounded-md bg-muted/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>SPF Record Configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>DKIM Authentication Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>DMARC Policy Set</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Accessibility Checks</Label>
              <div className="p-4 border rounded-md bg-muted/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Alt Text for Images</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Color Contrast Ratio</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Text-to-HTML Ratio</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch defaultChecked />
                Automatic Image Optimization
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Optimize images for faster loading and better deliverability.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search Engine Preview</Label>
              <div className="p-4 border rounded-md bg-white">
                <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer flex items-center">
                  Your Campaign Title <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
                <div className="text-green-700 text-sm">
                  https://yourdomain.com/campaign/preview
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  Your campaign meta description will appear here. Make sure
                  it's compelling and includes your target keywords.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Client Preview</Label>
              <div className="p-4 border rounded-md bg-white">
                <div className="text-gray-800 font-medium">
                  From: Your Name &lt;your@email.com&gt;
                </div>
                <div className="text-gray-800 font-medium">
                  Subject: Your Campaign Subject
                </div>
                <div className="text-gray-600 text-sm mt-2 border-t pt-2">
                  Preview text will appear here. This is what recipients will
                  see in their inbox before opening.
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Run SEO Analysis
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
