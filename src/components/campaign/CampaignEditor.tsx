import React, { useState } from "react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import CampaignDetailsForm from "./CampaignDetailsForm";
import RichTextEditor from "./RichTextEditor";
import CampaignPreview from "./CampaignPreview";

interface CampaignEditorProps {
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

const CampaignEditor = ({
  onContentChange = () => {},
  onDetailsChange = () => {},
  initialContent = "",
  initialDetails = {
    subject: "",
    senderName: "",
    senderEmail: "",
    subscriberList: "",
  },
}: CampaignEditorProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [content, setContent] = useState(initialContent);
  const [details, setDetails] = useState(initialDetails);
  const { toast } = useToast();

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange(newContent);
  };

  const handleDetailsChange = (newDetails: CampaignDetails) => {
    setDetails(newDetails);
    onDetailsChange(newDetails);
  };

  const handleSendTest = () => {
    // TODO: Implement send test email functionality
    toast({
      title: "Coming Soon",
      description: "Send test email functionality will be added soon!",
    });
  };

  return (
    <Card className="w-full h-full bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <div className="flex items-center justify-between border-b px-6 py-3">
          <TabsList>
            <TabsTrigger value="details">Campaign Details</TabsTrigger>
            <TabsTrigger value="content">Email Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSendTest}>
              Send Test
            </Button>
            <Button>Save & Continue</Button>
          </div>
        </div>

        <div className="p-6 h-[calc(100%-64px)] overflow-auto">
          <TabsContent value="details" className="mt-0 h-full">
            <CampaignDetailsForm
              onDetailsChange={handleDetailsChange}
              initialDetails={details}
            />
          </TabsContent>

          <TabsContent value="content" className="mt-0 h-full">
            <RichTextEditor content={content} onChange={handleContentChange} />
          </TabsContent>

          <TabsContent value="preview" className="mt-0 h-full">
            <CampaignPreview content={content} subject={details.subject} />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};

export default CampaignEditor;
