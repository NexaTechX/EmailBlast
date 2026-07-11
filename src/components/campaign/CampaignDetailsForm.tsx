import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { getSubscriberLists } from "@/lib/api";
import type { SubscriberList } from "@/types";

export interface CampaignDetails {
  subject: string;
  senderName: string;
  senderEmail: string;
  subscriberList: string;
  scheduleDate?: Date;
}

interface CampaignDetailsFormProps {
  onDetailsChange?: (details: CampaignDetails) => void;
  initialDetails?: CampaignDetails;
}

function FieldRow({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 border-b border-border/80 px-3 py-1.5 ${className}`}
    >
      <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
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
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <FieldRow label="Subject">
        <Input
          id="subject"
          placeholder="Inbox subject line"
          value={details.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          className="h-8 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0"
        />
      </FieldRow>

      <div className="grid lg:grid-cols-[1fr_1fr_minmax(11rem,0.85fr)]">
        <FieldRow label="From" className="lg:border-b-0 lg:border-r">
          <Input
            id="senderName"
            placeholder="Display name"
            value={details.senderName}
            onChange={(e) => handleChange("senderName", e.target.value)}
            className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
        </FieldRow>
        <FieldRow label="Reply" className="lg:border-b-0 lg:border-r">
          <Input
            id="senderEmail"
            type="email"
            placeholder="you@company.com"
            value={details.senderEmail}
            onChange={(e) => handleChange("senderEmail", e.target.value)}
            className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
        </FieldRow>
        <FieldRow label="List" className="border-b-0">
          <Select
            value={details.subscriberList}
            onValueChange={(value) => handleChange("subscriberList", value)}
          >
            <SelectTrigger className="h-8 border-0 bg-transparent px-0 shadow-none focus:ring-0">
              <SelectValue placeholder={loading ? "Loading…" : "Select list"} />
            </SelectTrigger>
            <SelectContent>
              {subscriberLists.length === 0 ? (
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  No lists yet.{" "}
                  <Link
                    to="/app/subscribers"
                    className="underline underline-offset-2"
                  >
                    Create one
                  </Link>
                </div>
              ) : (
                subscriberLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                    {typeof list.total_subscribers === "number"
                      ? ` · ${list.total_subscribers}`
                      : ""}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </FieldRow>
      </div>
    </div>
  );
};

export default CampaignDetailsForm;
