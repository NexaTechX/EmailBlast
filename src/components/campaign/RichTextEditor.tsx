import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/use-toast";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Type,
  FileCode,
  Eye,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { useState } from "react";
import {
  generateContentWithGemini,
  enhanceContentWithGemini,
} from "@/lib/gemini-api";

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
}

const RichTextEditor = ({
  content = "<p>Start composing your email campaign...</p>",
  onChange = () => {},
}: RichTextEditorProps) => {
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "code">("edit");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = () => {
    const url = window.prompt(
      "Enter image URL",
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
    );
    if (url && editor) {
      editor.chain().focus().setImage({ src: url, alt: "Email image" }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const copyToClipboard = () => {
    if (editor) {
      navigator.clipboard.writeText(editor.getHTML());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "HTML content has been copied to clipboard",
      });
    }
  };

  const generateAIContent = async () => {
    // Open a prompt dialog for the user to provide instructions
    const userPrompt = window.prompt(
      "What kind of email content would you like to create? (e.g., welcome email, product announcement, newsletter)",
      "Create a welcome email for new subscribers",
    );

    if (!userPrompt) return;

    toast({
      title: "Generating Content",
      description: "AI is creating content based on your instructions...",
    });

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
                text: `Generate HTML content for an email marketing campaign based on this prompt: "${userPrompt}". 
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

      if (editor) {
        editor.commands.setContent(generatedContent.trim());
        onChange(generatedContent.trim());

        toast({
          title: "AI Content Generated",
          description: "Content has been created based on your instructions.",
        });
      }
    } catch (error) {
      console.error("Error with Gemini API:", error);

      // Fallback to local generation if API fails
      if (editor) {
        // Generate content based on the prompt
        let generatedContent = "";

        if (userPrompt.toLowerCase().includes("welcome")) {
          generatedContent = `
            <h2>Welcome to Our Community!</h2>
            <p>Dear Subscriber,</p>
            <p>We're thrilled to have you join us. Thank you for subscribing to our newsletter!</p>
            <p>Here's what you can expect from us:</p>
            <ul>
              <li>Weekly updates on industry trends</li>
              <li>Exclusive content just for subscribers</li>
              <li>Special offers and early access to new features</li>
            </ul>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br>The Team</p>
          `;
        } else if (userPrompt.toLowerCase().includes("product")) {
          generatedContent = `
            <h2>Introducing Our New Product!</h2>
            <p>Dear Valued Customer,</p>
            <p>We're excited to announce the launch of our latest product that will transform how you work.</p>
            <h3>Key Features:</h3>
            <ul>
              <li><strong>Streamlined Workflow</strong> - Save time with our intuitive interface</li>
              <li><strong>Advanced Analytics</strong> - Gain deeper insights into your performance</li>
              <li><strong>Seamless Integration</strong> - Works with all your favorite tools</li>
            </ul>
            <p><a href="#">Click here</a> to learn more and get an exclusive early-bird discount!</p>
            <p>Warm regards,<br>The Product Team</p>
          `;
        } else if (userPrompt.toLowerCase().includes("newsletter")) {
          generatedContent = `
            <h2>This Month's Newsletter</h2>
            <p>Dear Subscriber,</p>
            <p>We hope this newsletter finds you well. Here's what we've been working on this month:</p>
            <h3>Highlights:</h3>
            <ul>
              <li>Our annual conference was a huge success with over 1,000 attendees</li>
              <li>We've released version 2.0 of our platform with exciting new features</li>
              <li>Our community has grown to over 10,000 members worldwide</li>
            </ul>
            <p>Check out our <a href="#">blog</a> for more detailed updates and stories.</p>
            <p>Until next month,<br>The Newsletter Team</p>
          `;
        } else {
          generatedContent = `
            <h2>${userPrompt.split(" ").slice(0, 3).join(" ")}...</h2>
            <p>Dear Subscriber,</p>
            <p>Thank you for your continued support. We have some exciting news to share with you.</p>
            <p>${userPrompt}</p>
            <p>We hope you find this information valuable. Please don't hesitate to reach out if you have any questions.</p>
            <p>Best regards,<br>The Team</p>
          `;
        }

        editor.commands.setContent(generatedContent.trim());
        onChange(generatedContent.trim());

        toast({
          title: "AI Content Generated (fallback)",
          description:
            "Content has been created based on your instructions using local generation.",
        });
      }
    }
  };

  if (!editor) return null;

  return (
    <Card className="w-full h-full bg-background">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-muted" : ""}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-muted" : ""}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "bg-muted" : ""}
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={
              editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""
            }
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={
              editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""
            }
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={
              editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""
            }
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive("paragraph") ? "bg-muted" : ""}
          >
            <Pilcrow className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={generateAIContent}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Enhance
          </Button>
          <Button variant="ghost" size="icon" onClick={copyToClipboard}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <Button
          variant="ghost"
          size="icon"
          onClick={addLink}
          className={editor.isActive("link") ? "bg-muted" : ""}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "bg-muted" : ""}
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col h-[calc(100%-96px)]">
        <div className="p-4 min-h-[500px] prose prose-sm max-w-none flex-grow overflow-auto">
          <EditorContent editor={editor} />
        </div>

        <div className="p-2 border-t flex justify-between items-center bg-muted/20">
          <div className="text-xs text-muted-foreground">
            <span>
              💡 Tip: Use the AI Assistant for help creating professional email
              content
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addImage}>
              <ImageIcon className="h-4 w-4 mr-2" /> Add Image
            </Button>
            <Button variant="outline" size="sm" onClick={addLink}>
              <LinkIcon className="h-4 w-4 mr-2" /> Add Link
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RichTextEditor;
