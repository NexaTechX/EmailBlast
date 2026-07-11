import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Save, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { sendTestEmail } from "@/lib/resend";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { analyzeCompliance } from "@/lib/compliance";
import { Link } from "react-router-dom";

interface CampaignHeaderProps {
  title?: string;
  onTitleChange?: (title: string) => void;
  onSaveDraft?: () => void;
  onSchedule?: (scheduledFor: string) => void;
  onSend?: () => void;
  campaign?: {
    title: string;
    content: string;
    details: {
      subject: string;
      senderName: string;
      senderEmail: string;
      subscriberList: string;
    };
  };
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
    setEditedTitle(title);
  }, [title]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("mailing_address")
      .maybeSingle()
      .then(({ data }) => {
        setMailingAddressSet(Boolean(data?.mailing_address?.trim()));
      });
  }, []);

  const commitTitle = () => {
    setIsEditing(false);
    if (editedTitle.trim() !== "") {
      onTitleChange(editedTitle.trim());
    } else {
      setEditedTitle(title);
    }
  };

  const handleScheduleSubmit = () => {
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    onSchedule(scheduledDateTime.toISOString());
    setShowScheduleDialog(false);
  };

  const handleSendTest = async () => {
    if (!campaign || !testEmail) {
      toast({
        title: "Email required",
        description: "Enter a valid address for the test send.",
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
        title: "Test sent",
        description: `Sent to ${testEmail}`,
      });
      setShowTestDialog(false);
      setTestEmail("");
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Failed to send test email.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendNow = async () => {
    if (!campaign?.details.subscriberList) {
      toast({
        title: "Audience required",
        description: "Select a subscriber list before sending.",
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
        description: "Failed to send campaign.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const compliance = campaign
    ? analyzeCompliance(
        campaign.content || "",
        campaign.details?.subject || "",
      )
    : { score: 0, checks: [] };
  const hasList = Boolean(campaign?.details?.subscriberList);
  const hasSubject = Boolean(campaign?.details?.subject?.trim());
  const hasBody = Boolean(
    campaign?.content &&
      campaign.content.replace(/<[^>]+>/g, "").trim().length > 0,
  );
  const canSend =
    hasList &&
    mailingAddressSet &&
    hasSubject &&
    hasBody &&
    compliance.score >= 50;

  return (
    <header className="shrink-0 border-b border-border bg-background">
      <div className="flex items-center justify-between gap-3 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            asChild
          >
            <Link to="/app/campaigns" aria-label="Back to campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1 max-w-md">
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitTitle();
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditedTitle(title);
                  }
                }}
                className="h-8 border-border text-sm font-semibold"
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setEditedTitle(title);
                }}
                className="block w-full truncate text-left text-sm font-semibold tracking-tight hover:text-foreground/80"
                title="Click to rename"
              >
                {title}
              </button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={saving}
            className="h-8"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save"}
          </Button>

          <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send test email</DialogTitle>
                <DialogDescription>
                  Delivers a single copy with no list tracking.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="test-email">Email address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="you@company.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
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
                  {isSendingTest ? "Sending…" : "Send test"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showScheduleDialog}
            onOpenChange={setShowScheduleDialog}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule campaign</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="schedule-date">Date</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
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
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            onClick={handleSendNow}
            disabled={isSending}
            className="h-8 bg-signal text-white hover:bg-signal/90"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {isSending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>

      <Dialog open={showPreSendDialog} onOpenChange={setShowPreSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ready to send?</DialogTitle>
            <DialogDescription>
              Confirm these items before delivering to your list.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 py-2 text-sm">
            {[
              { ok: hasSubject, label: "Subject line filled" },
              { ok: hasBody, label: "Email body has content" },
              { ok: hasList, label: "Subscriber list selected" },
              {
                ok: mailingAddressSet,
                label: "Mailing address in Settings → Sending",
              },
              {
                ok: compliance.score >= 50,
                label: `Compliance score ${compliance.score}/100`,
              },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 shrink-0 ${
                    item.ok ? "text-signal" : "text-muted-foreground/40"
                  }`}
                />
                {item.label}
              </li>
            ))}
            <li className="pt-1 text-xs text-muted-foreground">
              Free plan: 100 emails/month enforced server-side.
            </li>
          </ul>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreSendDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSend}
              disabled={!canSend}
              className="bg-signal text-white hover:bg-signal/90"
            >
              Send to list
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default CampaignHeader;
