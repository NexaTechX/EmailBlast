import React from "react";
import CampaignDetailsForm from "./CampaignDetailsForm";
import RichTextEditor from "./RichTextEditor";

interface CampaignEditorProps {
  onContentChange?: (content: string) => void;
  onDetailsChange?: (details: any) => void;
  initialContent?: string;
  initialDetails?: {
    subject: string;
    senderName: string;
    senderEmail: string;
    subscriberList: string;
  };
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
  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto p-6 space-y-6">
      <CampaignDetailsForm
        onDetailsChange={onDetailsChange}
        initialDetails={initialDetails}
      />
      <RichTextEditor content={initialContent} onChange={onContentChange} />
    </div>
  );
};

export default CampaignEditor;
