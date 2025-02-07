import React from "react";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import DatePickerWithRange from "../ui/date-picker-with-range";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { InfoIcon, Users } from "lucide-react";

interface CampaignDetailsFormProps {
  onDetailsChange?: (details: CampaignDetails) => void;
  initialDetails?: CampaignDetails;
}

interface CampaignDetails {
  subject: string;
  senderName: string;
  senderEmail: string;
  subscriberList: string;
  scheduleDate?: Date;
}

const defaultSubscriberLists = [
  {
    id: "1",
    name: "Main Newsletter List",
    subscribers: 2500,
    engagementRate: 45,
  },
  { id: "2", name: "New Subscribers", subscribers: 500, engagementRate: 60 },
  { id: "3", name: "VIP Customers", subscribers: 1000, engagementRate: 75 },
];

const CampaignDetailsForm = ({
  onDetailsChange = () => {},
  initialDetails = {
    subject: "",
    senderName: "",
    senderEmail: "",
    subscriberList: "",
  },
}: CampaignDetailsFormProps) => {
  return (
    <Card className="p-6 bg-white">
      <form className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              placeholder="Enter your email subject line"
              defaultValue={initialDetails.subject}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="senderName">Sender Name</Label>
              <Input
                id="senderName"
                placeholder="Your name or company name"
                defaultValue={initialDetails.senderName}
              />
            </div>
            <div>
              <Label htmlFor="senderEmail">Sender Email</Label>
              <Input
                id="senderEmail"
                type="email"
                placeholder="your@email.com"
                defaultValue={initialDetails.senderEmail}
              />
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              Subscriber List
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the list of subscribers for this campaign</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select defaultValue={initialDetails.subscriberList}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a subscriber list" />
              </SelectTrigger>
              <SelectContent>
                {defaultSubscriberLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{list.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Users className="h-3 w-3" />
                          {list.subscribers.toLocaleString()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {list.engagementRate}% Engagement
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Schedule</Label>
            <DatePickerWithRange />
          </div>
        </div>
      </form>
    </Card>
  );
};

export default CampaignDetailsForm;
