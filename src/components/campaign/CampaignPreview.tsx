import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Monitor, Smartphone } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { sendTestEmail } from "@/lib/brevo";

interface CampaignPreviewProps {
  content?: string;
  subject?: string;
}

const CampaignPreview = ({
  content = "<p>This is a preview of your email content...</p>",
  subject = "Sample Email Campaign",
}: CampaignPreviewProps) => {
  const [activeView, setActiveView] = useState("desktop");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
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
          subject: subject,
          content: content,
          sender_name: "Test Sender",
          sender_email: "test@example.com",
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          list_id: "test",
        },
        testEmail,
      );

      toast({
        title: "Success",
        description: "Test email sent successfully",
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="w-full h-full bg-white p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-lg font-semibold">Preview</h3>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs
          defaultValue="desktop"
          value={activeView}
          onValueChange={setActiveView}
        >
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="desktop" className="h-full mt-4">
            <div className="max-w-[800px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <div className="text-sm text-gray-600">Subject: {subject}</div>
              </div>
              <div
                className="p-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="h-full mt-4">
            <div className="max-w-[375px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden border">
              <div className="p-3 border-b">
                <div className="text-sm text-gray-600">Subject: {subject}</div>
              </div>
              <div
                className="p-4"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <div className="flex-1">
          <input
            type="email"
            placeholder="Enter test email address"
            className="w-full px-3 py-2 border rounded-md"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handleSendTest} disabled={sending}>
          {sending ? "Sending..." : "Send Test Email"}
        </Button>
        <Button variant="outline">Download Preview</Button>
      </div>
    </Card>
  );
};

export default CampaignPreview;
