import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, RefreshCw, Copy, Check } from "lucide-react";

interface AIContentGeneratorProps {
  onSelectContent?: (content: string) => void;
}

export function AIContentGenerator({
  onSelectContent = () => {},
}: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    subject: string;
    body: string;
    cta: string;
  }>({ subject: "", body: "", cta: "" });
  const [copied, setCopied] = useState<"subject" | "body" | "cta" | null>(null);

  const generateContent = async () => {
    if (!prompt) return;

    setLoading(true);

    // Simulate AI generation (replace with actual API call)
    setTimeout(() => {
      setGeneratedContent({
        subject: `Discover how ${prompt} can transform your business`,
        body: `<p>Hello,</p><p>We've been researching companies in your industry and noticed that ${prompt} could significantly improve your operations.</p><p>Our solution has helped similar businesses achieve:</p><ul><li>20% increase in efficiency</li><li>35% cost reduction</li><li>Improved customer satisfaction</li></ul><p>Would you be interested in a quick 15-minute call to discuss how we might help your specific situation?</p>`,
        cta: "Schedule a free consultation",
      });
      setLoading(false);
    }, 1500);
  };

  const copyToClipboard = (type: "subject" | "body" | "cta") => {
    const content = generatedContent[type];
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const useContent = (type: "subject" | "body" | "cta") => {
    onSelectContent(generatedContent[type]);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">AI Content Generator</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">What are you promoting?</Label>
          <div className="flex gap-2">
            <Input
              id="prompt"
              placeholder="e.g., CRM software, marketing services, etc."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button onClick={generateContent} disabled={!prompt || loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>

        {generatedContent.subject && (
          <Tabs defaultValue="subject" className="mt-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="subject">Subject Line</TabsTrigger>
              <TabsTrigger value="body">Email Body</TabsTrigger>
              <TabsTrigger value="cta">Call to Action</TabsTrigger>
            </TabsList>

            <TabsContent value="subject" className="space-y-4">
              <div className="p-4 border rounded-md bg-muted/30">
                <p>{generatedContent.subject}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard("subject")}
                >
                  {copied === "subject" ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied === "subject" ? "Copied" : "Copy"}
                </Button>
                <Button size="sm" onClick={() => useContent("subject")}>
                  Use This Subject
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="body" className="space-y-4">
              <div className="p-4 border rounded-md bg-muted/30">
                <div
                  dangerouslySetInnerHTML={{ __html: generatedContent.body }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard("body")}
                >
                  {copied === "body" ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied === "body" ? "Copied" : "Copy"}
                </Button>
                <Button size="sm" onClick={() => useContent("body")}>
                  Use This Content
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="cta" className="space-y-4">
              <div className="p-4 border rounded-md bg-muted/30">
                <p>{generatedContent.cta}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard("cta")}
                >
                  {copied === "cta" ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied === "cta" ? "Copied" : "Copy"}
                </Button>
                <Button size="sm" onClick={() => useContent("cta")}>
                  Use This CTA
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Card>
  );
}
