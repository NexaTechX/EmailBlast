import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import CampaignDetailsForm from "./CampaignDetailsForm";
import RichTextEditor from "./RichTextEditor";
import CampaignPreview from "./CampaignPreview";
import { AIContentGenerator } from "../ai/ai-content-generator";
import { ColdOutreachTools } from "./cold-outreach-tools";
import { CampaignAutomation } from "./campaign-automation";
import { Sparkles, Zap, Clock } from "lucide-react";

interface EnhancedCampaignEditorProps {
  onContentChange?: (content: string) => void;
  onDetailsChange?: (details: CampaignDetails) => void;
  initialContent?: string;
  initialDetails?: CampaignDetails;
}

interface CampaignDetails {
  subject: string;
  senderName: string;
  senderEmail: string;
  subscriberList: string;
}

const EnhancedCampaignEditor = ({
  onContentChange = () => {},
  onDetailsChange = () => {},
  initialContent = "",
  initialDetails = {
    subject: "",
    senderName: "",
    senderEmail: "",
    subscriberList: "",
  },
}: EnhancedCampaignEditorProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [content, setContent] = useState(initialContent);
  const [details, setDetails] = useState(initialDetails);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const { toast } = useToast();

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange(newContent);
  };

  const handleDetailsChange = (newDetails: CampaignDetails) => {
    setDetails(newDetails);
    onDetailsChange(newDetails);
  };

  const handleAIContent = (generatedContent: string) => {
    if (activeTab === "content") {
      handleContentChange(generatedContent);
    } else if (activeTab === "details" && generatedContent) {
      handleDetailsChange({
        ...details,
        subject: generatedContent,
      });
    }
  };

  const handleSendTest = () => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to your address.",
    });
  };

  return (
    <Card className="w-full h-full bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <div className="flex items-center justify-between border-b px-6 py-3">
          <TabsList>
            <TabsTrigger value="details">Campaign Details</TabsTrigger>
            <TabsTrigger value="content">Email Content</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="outreach">Cold Outreach</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className={aiPanelOpen ? "bg-primary/10" : ""}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            <Button variant="outline" onClick={handleSendTest}>
              Send Test
            </Button>
            <Button>Save & Continue</Button>
          </div>
        </div>

        <div className="flex h-[calc(100%-64px)]">
          <div
            className={`${aiPanelOpen ? "w-2/3" : "w-full"} overflow-auto p-6`}
          >
            <TabsContent value="details" className="mt-0 h-full">
              <CampaignDetailsForm
                onDetailsChange={handleDetailsChange}
                initialDetails={details}
              />
            </TabsContent>

            <TabsContent value="content" className="mt-0 h-full">
              <RichTextEditor
                content={content}
                onChange={handleContentChange}
              />
            </TabsContent>

            <TabsContent value="automation" className="mt-0 h-full">
              <CampaignAutomation />
            </TabsContent>

            <TabsContent value="outreach" className="mt-0 h-full">
              <ColdOutreachTools />
            </TabsContent>

            <TabsContent value="preview" className="mt-0 h-full">
              <CampaignPreview content={content} subject={details.subject} />
            </TabsContent>
          </div>

          {aiPanelOpen && (
            <div className="w-1/3 border-l p-4 overflow-auto">
              <AIContentGenerator onSelectContent={handleAIContent} />
            </div>
          )}
        </div>
      </Tabs>
    </Card>
  );
};

export default EnhancedCampaignEditor;
