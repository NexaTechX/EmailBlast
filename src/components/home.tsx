import React, { useState } from "react";
import CampaignHeader from "./campaign/CampaignHeader";
import CampaignEditor from "./campaign/CampaignEditor";
import CampaignPreview from "./campaign/CampaignPreview";

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

  return (
    <div className="min-h-screen bg-gray-100">
      <CampaignHeader
        title={campaign.title}
        onTitleChange={handleTitleChange}
        onSaveDraft={() => console.log("Saving draft...")}
        onSchedule={() => console.log("Opening schedule dialog...")}
        onSend={() => console.log("Sending campaign...")}
      />

      <div className="flex h-[calc(100vh-72px)]">
        <div className="w-1/2 border-r border-gray-200">
          <CampaignEditor
            onContentChange={handleContentChange}
            onDetailsChange={handleDetailsChange}
            initialContent={campaign.content}
            initialDetails={campaign.details}
          />
        </div>
        <div className="w-1/2">
          <CampaignPreview
            content={campaign.content}
            subject={campaign.details.subject}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
