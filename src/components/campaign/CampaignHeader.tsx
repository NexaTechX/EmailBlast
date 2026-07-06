import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Clock, Save, Send, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { sendTestEmail } from "@/lib/brevo";
import { useToast } from "../ui/use-toast";
import { supabase } from "@/lib/supabase";
import { analyzeCompliance } from "@/lib/compliance";

interface CampaignHeaderProps {
  title?: string;
  onTitleChange?: (title: string) => void;
  onSaveDraft?: () => void;
  onSchedule?: (scheduledFor: string) => void;
  onSend?: () => void;
  campaign?: any;
  saving?: boolean;
}

const CampaignHeader = ({
  title = "Untitled Campaign",
  onTitleChange = () => {},
  onSaveDraft = () => {},
  onSchedule = () => {},
  onSend = () => {},
  campaign,
  saving = false,
}: CampaignHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showPreSendDialog, setShowPreSendDialog] = useState(false);
  const [mailingAddressSet, setMailingAddressSet] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from("profiles")
      .select("mailing_address")
      .maybeSingle()
      .then(({ data }) => {
        setMailingAddressSet(Boolean(data?.mailing_address?.trim()));
      });
  }, []);

  const handleTitleClick = () => {
    setIsEditing(true);
    setEditedTitle(title);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (editedTitle.trim() !== "") {
      onTitleChange(editedTitle);
    } else {
      setEditedTitle(title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedTitle(title);
    }
  };

  const handleScheduleSubmit = () => {
    // Combine date and time for scheduling
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    onSchedule(scheduledDateTime.toISOString());
    setShowScheduleDialog(false);
  };

  const handleSendTest = async () => {
    if (!campaign || !testEmail) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);
    try {
      await sendTestEmail(
        {
          id: "test-campaign",
          title: campaign.title,
          subject: campaign.details.subject,
          content: campaign.content,
          sender_name: campaign.details.senderName,
          sender_email: campaign.details.senderEmail,
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          list_id: campaign.details.subscriberList,
        },
        testEmail,
      );

      toast({
        title: "Test Email Sent",
        description: `A test email has been sent to ${testEmail}`,
      });
      setShowTestDialog(false);
      setTestEmail("");
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Failed to send test email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendNow = async () => {
    if (!campaign || !campaign.details.subscriberList) {
      toast({
        title: "Error",
        description:
          "Campaign details are incomplete. Please select a subscriber list.",
        variant: "destructive",
      });
      return;
    }
    setShowPreSendDialog(true);
  };

  const confirmSend = async () => {
    setShowPreSendDialog(false);
    setIsSending(true);
    try {
      await onSend();
    } catch (error) {
      console.error("Error sending campaign:", error);
      toast({
        title: "Error",
        description: "Failed to send campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const compliance = campaign
    ? analyzeCompliance(campaign.content || "", campaign.details?.subject || "")
    : { score: 0, checks: [] };
  const hasList = Boolean(campaign?.details?.subscriberList);
  const canSend = hasList && mailingAddressSet && compliance.score >= 50;

  return (
    <Card className="w-full bg-white p-4 border-b">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md min-w-0">
          {isEditing ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-lg font-semibold border-primary"
              autoFocus
            />
          ) : (
            <h1
              className="text-lg font-semibold cursor-pointer hover:text-primary"
              onClick={handleTitleClick}
            >
              {title}
            </h1>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onSaveDraft}
            className="flex items-center gap-2"
            disabled={saving}
            aria-label="Save draft"
          >
            <Save className="h-4 w-4" />
            <span className="hidden xs:inline">{saving ? "Saving..." : "Save Draft"}</span>
          </Button>

          <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2" aria-label="Send test email">
                <span className="sm:hidden">Test</span>
                <span className="hidden sm:inline">Send Test</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Test Email</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="test-email">Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="Enter email address"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowTestDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendTest}
                  disabled={!testEmail || isSendingTest}
                >
                  {isSendingTest ? "Sending..." : "Send Test"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showScheduleDialog}
            onOpenChange={setShowScheduleDialog}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2" aria-label="Schedule campaign">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Campaign</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="schedule-date">Date</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schedule-time">Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleSubmit}
                  disabled={!scheduleDate || !scheduleTime}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Campaign
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleSendNow}
            disabled={isSending}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Send campaign now"
          >
            <Send className="h-4 w-4" />
            {isSending ? "Sending..." : "Send Now"}
          </Button>
        </div>
      </div>

      <Dialog open={showPreSendDialog} onOpenChange={setShowPreSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pre-send checklist</DialogTitle>
            <DialogDescription>
              Confirm these items before sending to your list.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm py-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className={`h-4 w-4 ${hasList ? "text-emerald-600" : "text-muted-foreground"}`} />
              Subscriber list selected
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className={`h-4 w-4 ${mailingAddressSet ? "text-emerald-600" : "text-muted-foreground"}`} />
              Physical mailing address in Settings → Sending
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className={`h-4 w-4 ${compliance.score >= 50 ? "text-emerald-600" : "text-muted-foreground"}`} />
              Compliance score: {compliance.score}/100
            </li>
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreSendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSend} disabled={!canSend}>
              Send to list
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CampaignHeader;
