import React, { useState } from "react";
import CampaignHeader from "./campaign/CampaignHeader";
import EnhancedCampaignEditor from "./campaign/enhanced-campaign-editor";
import { useToast } from "./ui/use-toast";

interface CampaignState {
  title: string;
  content: string;
  details: {
    subject: string;
    senderName: string;
    senderEmail: string;
    subscriberList: string;
  };
}

const Home = () => {
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<CampaignState>({
    title: "Untitled Campaign",
    content: "<p>Start composing your email campaign...</p>",
    details: {
      subject: "",
      senderName: "",
      senderEmail: "",
      subscriberList: "",
    },
  });

  const handleTitleChange = (newTitle: string) => {
    setCampaign((prev) => ({ ...prev, title: newTitle }));
  };

  const handleContentChange = (newContent: string) => {
    setCampaign((prev) => ({ ...prev, content: newContent }));
  };

  const handleDetailsChange = (newDetails: any) => {
    setCampaign((prev) => ({ ...prev, details: newDetails }));
  };

  const handleSaveDraft = () => {
    // Save draft logic would go here
    toast({
      title: "Draft Saved",
      description: "Your campaign draft has been saved successfully.",
    });
  };

  const handleSchedule = () => {
    // Schedule logic is handled in the CampaignHeader component
  };

  const handleSend = () => {
    // Send logic is handled in the CampaignHeader component
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CampaignHeader
        title={campaign.title}
        onTitleChange={handleTitleChange}
        onSaveDraft={handleSaveDraft}
        onSchedule={handleSchedule}
        onSend={handleSend}
        campaign={campaign}
      />

      <div className="flex h-[calc(100vh-72px)]">
        <div className="w-full border-r border-gray-200">
          <EnhancedCampaignEditor
            onContentChange={handleContentChange}
            onDetailsChange={handleDetailsChange}
            initialContent={campaign.content}
            initialDetails={campaign.details}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
