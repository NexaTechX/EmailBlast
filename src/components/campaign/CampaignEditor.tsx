import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { Badge } from "../ui/badge";
import CampaignDetailsForm from "./CampaignDetailsForm";
import RichTextEditor from "./RichTextEditor";
import CampaignPreview from "./CampaignPreview";
import { AIContentGenerator } from "../ai/ai-content-generator";
import { generateContentWithGemini } from "@/lib/gemini-api";
import { ColdOutreachTools } from "./cold-outreach-tools";
import { CampaignAutomation } from "./campaign-automation";
import { SEOOptimization } from "../seo/seo-optimization";
import { ABTestingTool } from "../ab-testing/ab-testing-tool";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Save, Send, Clock, Sparkles, Settings } from "lucide-react";

interface CampaignEditorProps {
  onContentChange?: (content: string) => void;
  onDetailsChange?: (details: CampaignDetails) => void;
  initialContent?: string;
  initialDetails?: CampaignDetails;
  campaignId?: string;
}

interface CampaignDetails {
  subject: string;
  senderName: string;
  senderEmail: string;
  subscriberList: string;
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
  campaignId,
}: CampaignEditorProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [content, setContent] = useState(initialContent);
  const [details, setDetails] = useState(initialDetails);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (campaignId) {
      loadCampaign(campaignId);
    }
  }, [campaignId]);

  const loadCampaign = async (id: string) => {
    try {
      // Check if the campaigns table exists
      const { error: tableCheckError } = await supabase
        .from("campaigns")
        .select("count")
        .limit(1);

      // If the table doesn't exist, don't try to load
      if (tableCheckError && tableCheckError.code === "42P01") {
        console.log("Campaigns table does not exist yet");
        return;
      }

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading campaign:", error);
        return;
      }

      if (data) {
        setContent(data.content);
        setDetails({
          subject: data.subject,
          senderName: data.sender_name,
          senderEmail: data.sender_email,
          subscriberList: data.list_id,
        });
        onContentChange(data.content);
        onDetailsChange({
          subject: data.subject,
          senderName: data.sender_name,
          senderEmail: data.sender_email,
          subscriberList: data.list_id,
        });
      }
    } catch (error) {
      console.error("Error loading campaign:", error);
    }
  };

  const handleContentChange = (newContent: string) => {
    if (typeof newContent === "string") {
      setContent(newContent);
      onContentChange(newContent);
    }
  };

  const handleDetailsChange = (newDetails: CampaignDetails) => {
    setDetails(newDetails);
    onDetailsChange(newDetails);
  };

  const handleAIContent = (generatedContent: string) => {
    if (!generatedContent) return;

    if (activeTab === "content") {
      handleContentChange(generatedContent);
    } else if (activeTab === "details") {
      handleDetailsChange({
        ...details,
        subject: generatedContent,
      });
    }
  };

  const handleSendTest = async () => {
    try {
      // Get the email address to send the test to
      const testEmail = window.prompt(
        "Enter email address to send test to:",
        "",
      );

      if (!testEmail) {
        return; // User cancelled
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
        toast({
          variant: "destructive",
          title: "Invalid Email",
          description: "Please enter a valid email address.",
        });
        return;
      }

      // In a real implementation, this would send a test email
      toast({
        title: "Test Email Sent",
        description: `A test email has been sent to ${testEmail}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send test email. Please try again.",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Check if the campaigns table exists
      const { error: tableCheckError } = await supabase
        .from("campaigns")
        .select("count")
        .limit(1);

      // If the table doesn't exist, show a message
      if (tableCheckError && tableCheckError.code === "42P01") {
        toast({
          variant: "destructive",
          title: "Database Setup Required",
          description:
            "Please run the SQL script to create the campaigns table first.",
        });
        return;
      }

      const campaignData = {
        title: details.subject,
        subject: details.subject,
        sender_name: details.senderName,
        sender_email: details.senderEmail,
        content: content,
        status: "draft",
        list_id: details.subscriberList,
        user_id: user?.id,
      };

      let result;
      if (campaignId) {
        // Update existing campaign
        result = await supabase
          .from("campaigns")
          .update(campaignData)
          .eq("id", campaignId);
      } else {
        // Create new campaign
        result = await supabase.from("campaigns").insert([campaignData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: "Campaign saved successfully.",
      });
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save campaign. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    setSending(true);
    try {
      // In a real implementation, this would schedule the campaign
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Campaign Scheduled",
        description: "Your campaign has been scheduled for sending.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule campaign. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="w-full h-full bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <div className="flex items-center justify-between border-b px-6 py-3">
          <TabsList>
            <TabsTrigger value="details">Campaign Details</TabsTrigger>
            <TabsTrigger value="content">Email Content</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="outreach">Cold Outreach</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className={aiPanelOpen ? "bg-primary/10" : ""}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            <Button variant="outline" onClick={handleSendTest}>
              <Send className="h-4 w-4 mr-2" />
              Send Test
            </Button>
            <Button
              variant="outline"
              onClick={handleSchedule}
              disabled={sending}
            >
              <Clock className="h-4 w-4 mr-2" />
              {sending ? "Scheduling..." : "Schedule"}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(100%-64px)]">
          <div
            className={`${aiPanelOpen ? "w-2/3" : "w-full"} overflow-auto p-6`}
          >
            <TabsContent value="details" className="mt-0 h-full">
              <CampaignDetailsForm
                onDetailsChange={handleDetailsChange}
                initialDetails={details}
              />
            </TabsContent>

            <TabsContent value="content" className="mt-0 h-full">
              <RichTextEditor
                content={content}
                onChange={handleContentChange}
              />
            </TabsContent>

            <TabsContent value="automation" className="mt-0 h-full">
              <CampaignAutomation />
            </TabsContent>

            <TabsContent value="outreach" className="mt-0 h-full">
              <ColdOutreachTools />
            </TabsContent>

            <TabsContent value="seo" className="mt-0 h-full">
              <SEOOptimization />
            </TabsContent>

            <TabsContent value="ab-testing" className="mt-0 h-full">
              <ABTestingTool />
            </TabsContent>

            <TabsContent value="preview" className="mt-0 h-full">
              <CampaignPreview content={content} subject={details.subject} />
            </TabsContent>
          </div>

          {aiPanelOpen && (
            <div className="w-1/3 border-l p-4 overflow-auto">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Assistant</h3>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  Powered by AI
                </Badge>
              </div>
              <AIContentGenerator onSelectContent={handleAIContent} />
            </div>
          )}
        </div>
      </Tabs>
    </Card>
  );
};

export default CampaignEditor;
