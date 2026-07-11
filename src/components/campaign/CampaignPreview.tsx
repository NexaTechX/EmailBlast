import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { sendTestEmail } from "@/lib/resend";
import { Monitor, Smartphone, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CampaignPreviewProps {
  content?: string;
  subject?: string;
  senderName?: string;
  senderEmail?: string;
  /** Slimmer layout for editor side panel */
  embedded?: boolean;
}

const FROM_DOMAIN = import.meta.env.VITE_RESEND_FROM_DOMAIN as
  | string
  | undefined;

const CampaignPreview = ({
  content = "<p></p>",
  subject = "",
  senderName = "Sender",
  senderEmail = "",
  embedded = false,
}: CampaignPreviewProps) => {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const platformFrom = FROM_DOMAIN
    ? `noreply@${FROM_DOMAIN}`
    : "verified domain";

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Email required",
        description: "Enter an address to receive the test.",
        variant: "destructive",
      });
      return;
    }
    if (!senderEmail.trim()) {
      toast({
        title: "Reply-to required",
        description: "Set reply-to in the compose fields first.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      await sendTestEmail(
        {
          id: "preview",
          title: "Test Email",
          subject: subject || "Test",
          content,
          sender_name: senderName,
          sender_email: senderEmail,
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          list_id: "test",
        },
        testEmail.trim(),
      );
      toast({
        title: "Test sent",
        description: `Delivered to ${testEmail.trim()}`,
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Send failed",
        description: "Could not send test email.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([`Subject: ${subject}\n\n`, content], {
      type: "text/html",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject.replace(/[^a-z0-9]/gi, "_") || "preview"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-md border border-border p-0.5">
          <button
            type="button"
            onClick={() => setView("desktop")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs transition-colors",
              view === "desktop"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setView("mobile")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs transition-colors",
              view === "mobile"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={handleDownload}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          HTML
        </Button>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-md border border-border bg-card shadow-sm",
          view === "mobile" && "mx-auto w-[min(100%,320px)]",
        )}
      >
        <div className="space-y-1 border-b border-border bg-muted/40 px-3 py-2.5">
          <p className="truncate text-sm font-medium">
            {subject || "Untitled subject"}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            From {senderName || "Sender"} &lt;{platformFrom}&gt;
          </p>
          {senderEmail ? (
            <p className="truncate text-[11px] text-muted-foreground">
              Reply-to {senderEmail}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "email-preview-body overflow-auto bg-card p-4",
            embedded ? "max-h-[360px]" : "max-h-[480px]",
          )}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <div className="mt-auto space-y-2 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">Send yourself a test</p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="you@company.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="h-9"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0"
            onClick={handleSendTest}
            disabled={sending}
          >
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignPreview;
