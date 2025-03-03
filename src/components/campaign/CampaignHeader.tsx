import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Clock, Save, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { sendCampaign, sendTestEmail } from "@/lib/brevo";
import { useToast } from "../ui/use-toast";

interface CampaignHeaderProps {
  title?: string;
  onTitleChange?: (title: string) => void;
  onSaveDraft?: () => void;
  onSchedule?: () => void;
  onSend?: () => void;
  campaign?: any;
}

const CampaignHeader = ({
  title = "Untitled Campaign",
  onTitleChange = () => {},
  onSaveDraft = () => {},
  onSchedule = () => {},
  onSend = () => {},
  campaign,
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
  const { toast } = useToast();

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
    console.log("Scheduling campaign for:", scheduledDateTime);
    onSchedule();
    setShowScheduleDialog(false);

    toast({
      title: "Campaign Scheduled",
      description: `Your campaign has been scheduled for ${scheduleDate} at ${scheduleTime}`,
    });
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

    setIsSending(true);
    try {
      // In a real implementation, you would fetch subscribers from the selected list
      // For now, we'll just simulate sending to a few subscribers
      const subscribers = ["test@example.com"];

      await sendCampaign(
        {
          id: "live-campaign-" + Date.now(),
          title: campaign.title,
          subject: campaign.details.subject,
          content: campaign.content,
          sender_name: campaign.details.senderName,
          sender_email: campaign.details.senderEmail,
          status: "sent",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          list_id: campaign.details.subscriberList,
        },
        subscribers,
      );

      toast({
        title: "Success",
        description: "Campaign has been sent successfully",
      });
      onSend();
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

  return (
    <Card className="w-full bg-white p-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onSaveDraft}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>

          <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Send Test
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
              <Button variant="outline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule
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
          >
            <Send className="h-4 w-4" />
            {isSending ? "Sending..." : "Send Now"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CampaignHeader;
