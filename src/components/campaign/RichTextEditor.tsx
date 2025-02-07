import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Link,
  Image,
  Code,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
}

const RichTextEditor = ({
  content = "<p>Enter your email content here...</p>",
  onChange,
}: RichTextEditorProps) => {
  const [activeTab, setActiveTab] = useState("visual");

  const handleContentChange = (newContent: string) => {
    onChange?.(newContent);
  };

  return (
    <Card className="w-full h-full bg-white p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2">
        <Tabs
          defaultValue="visual"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="icon">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Underline className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button variant="outline" size="icon">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <AlignRight className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button variant="outline" size="icon">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Code className="h-4 w-4" />
            </Button>
          </div>

          <TabsContent value="visual" className="mt-4">
            <Textarea
              className="min-h-[500px] resize-none"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start composing your email..."
            />
          </TabsContent>

          <TabsContent value="html" className="mt-4">
            <Textarea
              className="min-h-[500px] font-mono resize-none"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Enter HTML code here..."
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default RichTextEditor;
