import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, RefreshCw, Copy, Check, Lightbulb } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AIContentGeneratorProps {
  onSelectContent?: (content: string) => void;
}

export function AIContentGenerator({
  onSelectContent = () => {},
}: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const generateContent = async () => {
    // If prompt is empty, show some example prompts
    if (!prompt.trim()) {
      const examplePrompts = [
        "Create a welcome email for new subscribers",
        "Write a product launch announcement",
        "Draft a monthly newsletter with company updates",
        "Compose a thank you email for customers",
        "Create a promotional email for our holiday sale",
      ];

      const selectedPrompt = window.prompt(
        "What kind of email would you like to create? Or choose one of these examples:",
        examplePrompts.join("\n"),
      );

      if (selectedPrompt) {
        setPrompt(selectedPrompt);
      } else {
        toast({
          variant: "destructive",
          title: "Empty prompt",
          description:
            "Please enter instructions for the AI to generate content.",
        });
        return;
      }
    }
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Empty prompt",
        description:
          "Please enter instructions for the AI to generate content.",
      });
      return;
    }

    setLoading(true);
    try {
      // Use Gemini API to generate content
      const apiKey = "AIzaSyAj0x2tyqFkOG7lDCHk3ShzQAxpfat4Pcc";
      const apiUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Generate HTML content for an email marketing campaign based on this prompt: "${prompt}". 
                The content should be well-formatted with proper HTML tags including h1, h2, p, ul, li, etc. 
                Make it professional, engaging, and optimized for email marketing. 
                Include appropriate sections like greeting, body, call-to-action, and signature.
                Return ONLY the HTML content without any explanations or markdown formatting.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      };

      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content.parts[0].text;

      if (!generatedText) {
        throw new Error("No text generated from Gemini API");
      }

      // Extract HTML content from the response
      let generatedContent = generatedText;

      // Clean up the response if needed
      if (generatedContent.includes("```html")) {
        generatedContent = generatedContent
          .split("```html")[1]
          .split("```")[0]
          .trim();
      }

      // Generate a few variations with slight modifications
      const variations = [
        generatedContent,
        generatedContent
          .replace(/Dear (Subscriber|Customer|Client|User)/i, "Hello there")
          .replace(/(Best|Kind) regards/i, "Cheers"),
        generatedContent
          .replace(/<h[1-2]>/i, (match) => `${match}🚀 `)
          .replace(/<p>(Best|Kind) regards/i, "<p>Thank you for your time,"),
      ];

      setSuggestions(variations);
      toast({
        title: "Content generated",
        description: "AI has created content based on your instructions.",
      });
    } catch (error) {
      console.error("Error generating content:", error);

      // Fallback to local generation if API fails
      try {
        // Generate content based on prompt
        let generatedContent = "";

        if (
          prompt.toLowerCase().includes("welcome") ||
          prompt.toLowerCase().includes("introduction")
        ) {
          generatedContent = `<h2>Welcome to Our Newsletter!</h2>
<p>Dear Subscriber,</p>
<p>We're excited to have you join our community. Each month, we'll be sharing the latest updates, tips, and exclusive offers just for you.</p>
<p>In this edition, we're highlighting:</p>
<ul>
  <li>Our new product launch</li>
  <li>Expert tips to improve your workflow</li>
  <li>Upcoming events you won't want to miss</li>
</ul>
<p>Feel free to reply to this email with any questions or feedback.</p>
<p>Best regards,<br>The Team</p>`;
        } else if (
          prompt.toLowerCase().includes("product") ||
          prompt.toLowerCase().includes("launch")
        ) {
          generatedContent = `<h2>Introducing Our New Product!</h2>
<p>Dear Valued Customer,</p>
<p>We're thrilled to announce the launch of our latest product that's going to revolutionize how you work.</p>
<h3>Key Features:</h3>
<ul>
  <li><strong>Streamlined Interface</strong> - Intuitive design for maximum productivity</li>
  <li><strong>Advanced Analytics</strong> - Gain deeper insights into your performance</li>
  <li><strong>Cloud Integration</strong> - Access your work from anywhere, anytime</li>
</ul>
<p><a href="#">Click here</a> to learn more and get an exclusive early-bird discount!</p>
<p>Warm regards,<br>The Product Team</p>`;
        } else if (
          prompt.toLowerCase().includes("thank") ||
          prompt.toLowerCase().includes("appreciation")
        ) {
          generatedContent = `<h2>Thank You for Your Support!</h2>
<p>Dear Customer,</p>
<p>We wanted to take a moment to express our sincere gratitude for your continued support. Customers like you make what we do possible.</p>
<p>As a token of our appreciation, we're offering you:</p>
<ul>
  <li>A special 20% discount on your next purchase</li>
  <li>Early access to our upcoming features</li>
  <li>Complimentary consultation with our experts</li>
</ul>
<p>We look forward to serving you for many years to come.</p>
<p>With appreciation,<br>The Entire Team</p>`;
        } else {
          // Default content based on the prompt
          generatedContent = `<h2>${prompt.split(" ").slice(0, 5).join(" ")}...</h2>
<p>Dear Subscriber,</p>
<p>${prompt}</p>
<p>We hope you find this information valuable. Please don't hesitate to reach out if you have any questions.</p>
<p>Best regards,<br>The Team</p>`;
        }

        // Generate a few variations
        const variations = [
          generatedContent,
          generatedContent
            .replace("Dear Subscriber", "Hello there")
            .replace("Best regards", "Cheers"),
          generatedContent
            .replace("<h2>", "<h2>🚀 ")
            .replace("<p>Best regards", "<p>Thank you for your time,"),
        ];

        setSuggestions(variations);
        toast({
          title: "Content generated (fallback)",
          description:
            "AI has created content based on your instructions using local generation.",
        });
      } catch (fallbackError) {
        console.error("Fallback generation also failed:", fallbackError);
        toast({
          variant: "destructive",
          title: "Generation failed",
          description: "Failed to generate content. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (content: string) => {
    onSelectContent(content);
    toast({
      title: "Content applied",
      description: "The selected content has been applied to your email.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground mb-2">
          Tell the AI what kind of email content you want to create:
        </div>
        <Textarea
          placeholder="E.g., Create a welcome email for new subscribers that introduces our product and offers a 10% discount"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        <Button
          onClick={generateContent}
          disabled={loading || !prompt.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">AI Suggestions</h4>
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="p-3 hover:bg-muted/50 cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="text-sm font-medium">
                    Suggestion {index + 1}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <Check className="h-4 w-4 mr-1" /> Use This
                </Button>
              </div>
              <div
                className="text-sm prose prose-sm max-w-none overflow-hidden max-h-[150px] text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: suggestion }}
              />
            </Card>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-4">
        <p className="mb-1">
          💡 <strong>Tips for better results:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Be specific about your audience and purpose</li>
          <li>
            Mention any specific tone or style you want (formal, friendly, etc.)
          </li>
          <li>Include key points you want to highlight</li>
          <li>Specify any calls-to-action you want to include</li>
        </ul>
      </div>
    </div>
  );
}
