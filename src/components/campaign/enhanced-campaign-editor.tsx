import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import CampaignDetailsForm from "./CampaignDetailsForm";
import RichTextEditor from "./RichTextEditor";
import CampaignPreview from "./CampaignPreview";
import { AIContentGenerator } from "../ai/ai-content-generator";
import { ComplianceChecker } from "../compliance/compliance-checker";
import { TemplateGallery } from "./template-gallery";
import { Sparkles, FileText } from "lucide-react";
import type { EmailTemplate } from "@/lib/email-templates";

interface EnhancedCampaignEditorProps {
  onContentChange?: (content: string) => void;
  onDetailsChange?: (details: CampaignDetails) => void;
  initialContent?: string;
  initialDetails?: CampaignDetails;
  onSaveDraft?: () => void;
  saving?: boolean;
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
  onSaveDraft,
  saving = false,
}: EnhancedCampaignEditorProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [content, setContent] = useState(initialContent);
  const [details, setDetails] = useState(initialDetails);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    setDetails(initialDetails);
  }, [initialDetails]);

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

  const handleSelectTemplate = (template: EmailTemplate) => {
    handleContentChange(template.html);
    toast({
      title: "Template Applied",
      description: `"${template.name}" template has been applied to your campaign.`,
    });
    setTemplateGalleryOpen(false);
  };

  return (
    <>
      <TemplateGallery
        open={templateGalleryOpen}
        onOpenChange={setTemplateGalleryOpen}
        onSelectTemplate={handleSelectTemplate}
      />
      <Card className="w-full h-full bg-background">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="flex items-center justify-between border-b px-6 py-3">
            <TabsList>
              <TabsTrigger value="details">Campaign Details</TabsTrigger>
              <TabsTrigger value="content">Email Content</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setTemplateGalleryOpen(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant="outline"
                onClick={() => setAiPanelOpen(!aiPanelOpen)}
                className={aiPanelOpen ? "bg-primary/10" : ""}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              {onSaveDraft && (
                <Button onClick={onSaveDraft} disabled={saving}>
                  {saving ? "Saving..." : "Save Draft"}
                </Button>
              )}
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

              <TabsContent value="compliance" className="mt-0 h-full">
                <ComplianceChecker content={content} subject={details.subject} />
              </TabsContent>

              <TabsContent value="preview" className="mt-0 h-full">
                <CampaignPreview
                  content={content}
                  subject={details.subject}
                  senderName={details.senderName}
                  senderEmail={details.senderEmail}
                />
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
    </>
  );
};

export default EnhancedCampaignEditor;
