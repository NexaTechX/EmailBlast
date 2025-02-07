import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Clock, Save, Send } from "lucide-react";

interface CampaignHeaderProps {
  title?: string;
  onTitleChange?: (title: string) => void;
  onSaveDraft?: () => void;
  onSchedule?: () => void;
  onSend?: () => void;
}

const CampaignHeader = ({
  title = "Untitled Campaign",
  onTitleChange = () => {},
  onSaveDraft = () => {},
  onSchedule = () => {},
  onSend = () => {},
}: CampaignHeaderProps) => {
  return (
    <Card className="w-full bg-white p-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Campaign Title"
            className="text-lg font-semibold"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onSaveDraft}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button
            variant="outline"
            onClick={onSchedule}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Schedule
          </Button>
          <Button
            onClick={onSend}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
            Send Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CampaignHeader;
