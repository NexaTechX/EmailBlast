import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function CampaignEditor() {
  const [content, setContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const { toast } = useToast();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHtmlContent(e.target.value); // Sync with HTML view
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value);
    // Update the visual content when HTML is changed
    setContent(e.target.value);
  };

  const handleSave = () => {
    toast({
      title: "Content Saved",
      description: "Your email content has been saved.",
    });
  };

  const insertFormatting = (tag: string) => {
    // This is a simplified implementation
    // In a real app, you would use a proper rich text editor library
    const textarea = document.getElementById(
      "visual-editor",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText = "";
    switch (tag) {
      case "bold":
        newText = `<strong>${selectedText}</strong>`;
        break;
      case "italic":
        newText = `<em>${selectedText}</em>`;
        break;
      case "underline":
        newText = `<u>${selectedText}</u>`;
        break;
      case "list":
        newText = `\n<ul>\n  <li>${selectedText}</li>\n</ul>\n`;
        break;
      case "link":
        const url = prompt("Enter URL:", "https://");
        if (url) {
          newText = `<a href="${url}">${selectedText || url}</a>`;
        } else {
          return;
        }
        break;
      case "image":
        const imgUrl = prompt(
          "Enter image URL:",
          "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
        );
        if (imgUrl) {
          newText = `<img src="${imgUrl}" alt="Image" style="max-width: 100%" />`;
        } else {
          return;
        }
        break;
      default:
        newText = selectedText;
    }

    textarea.value = beforeText + newText + afterText;
    setContent(textarea.value);
    setHtmlContent(textarea.value); // Sync with HTML view
    textarea.focus();
    textarea.selectionStart = start + newText.length;
    textarea.selectionEnd = start + newText.length;
  };

  return (
    <Card className="p-4">
      <Tabs defaultValue="visual" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="visual">Visual Editor</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>
          <Button onClick={handleSave}>Save Content</Button>
        </div>

        <TabsContent value="visual" className="space-y-4">
          <div className="flex items-center gap-2 p-2 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting("bold")}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting("italic")}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting("underline")}
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button variant="ghost" size="icon">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <AlignRight className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting("link")}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertFormatting("image")}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Code className="h-4 w-4" />
            </Button>
          </div>

          <textarea
            id="visual-editor"
            className="w-full h-[500px] p-4 border rounded-md"
            placeholder="Start composing your email content..."
            value={content}
            onChange={handleContentChange}
          />

          <div className="p-4 border rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertFormatting("image")}
                >
                  <ImageIcon className="h-4 w-4 mr-2" /> Add Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertFormatting("link")}
                >
                  <LinkIcon className="h-4 w-4 mr-2" /> Add Link
                </Button>
              </div>
            </div>
            <div
              className="prose max-w-none p-4 bg-white rounded-md min-h-[200px]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </TabsContent>

        <TabsContent value="html" className="min-h-[500px]">
          <textarea
            id="html-editor"
            className="w-full h-[500px] font-mono text-sm p-4 border rounded-md"
            placeholder="Enter HTML content..."
            value={htmlContent}
            onChange={handleHtmlChange}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
