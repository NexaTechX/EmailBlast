import React, { useState, useEffect } from "react";
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
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { InfoIcon, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getSubscriberLists } from "@/lib/api";
import type { SubscriberList } from "@/types";

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

const CampaignDetailsForm = ({
  onDetailsChange = () => {},
  initialDetails = {
    subject: "",
    senderName: "",
    senderEmail: "",
    subscriberList: "",
  },
}: CampaignDetailsFormProps) => {
  const [details, setDetails] = useState(initialDetails);
  const [subscriberLists, setSubscriberLists] = useState<SubscriberList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriberLists();
  }, []);

  useEffect(() => {
    setDetails(initialDetails);
  }, [initialDetails]);

  const loadSubscriberLists = async () => {
    try {
      const lists = await getSubscriberLists();
      setSubscriberLists(lists);
    } catch (error) {
      console.error("Error loading subscriber lists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CampaignDetails, value: string) => {
    const updatedDetails = { ...details, [field]: value };
    setDetails(updatedDetails);
    onDetailsChange(updatedDetails);
  };

  return (
    <Card className="p-6 bg-white">
      <form className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject Line *</Label>
            <Input
              id="subject"
              placeholder="Enter your email subject line"
              value={details.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="senderName">Sender Name *</Label>
              <Input
                id="senderName"
                placeholder="Your name or company name"
                value={details.senderName}
                onChange={(e) => handleChange("senderName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="senderEmail">Sender Email *</Label>
              <Input
                id="senderEmail"
                type="email"
                placeholder="your@email.com"
                value={details.senderEmail}
                onChange={(e) => handleChange("senderEmail", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              Subscriber List *
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
            <Select
              value={details.subscriberList}
              onValueChange={(value) => handleChange("subscriberList", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a subscriber list" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    Loading lists...
                  </SelectItem>
                ) : subscriberLists.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No lists yet.{" "}
                    <Link
                      to="/app/subscribers"
                      className="text-primary underline"
                    >
                      Create a list
                    </Link>{" "}
                    and import subscribers first.
                  </div>
                ) : (
                  subscriberLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{list.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Users className="h-3 w-3" />
                            {list.total_subscribers?.toLocaleString() || 0}
                          </Badge>
                          {list.engagement_rate && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              {list.engagement_rate}% Engagement
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!loading && subscriberLists.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Campaigns need a subscriber list.{" "}
                <Link to="/app/subscribers" className="text-primary underline">
                  Set up your audience
                </Link>
              </p>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
};

export default CampaignDetailsForm;
