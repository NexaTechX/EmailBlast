import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CampaignHeader from "./campaign/CampaignHeader";
import EnhancedCampaignEditor from "./campaign/enhanced-campaign-editor";
import { useToast } from "./ui/use-toast";
import { useAuth } from "@/lib/auth";
import {
  getCampaign,
  createCampaign,
  updateCampaign,
} from "@/lib/api";
import { sendCampaign } from "@/lib/resend";
import { campaignSchema } from "@/lib/validations";
import type { Campaign } from "@/types";

interface CampaignState {
  id?: string;
  title: string;
  content: string;
  details: {
    subject: string;
    senderName: string;
    senderEmail: string;
    subscriberList: string;
  };
}

const Home = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState<CampaignState>({
    title: "Untitled Campaign",
    content: "<p></p>",
    details: {
      subject: "",
      senderName: "",
      senderEmail: user?.email || "",
      subscriberList: "",
    },
  });

  // Load campaign if editing
  useEffect(() => {
    if (id && id !== "new") {
      loadCampaign(id);
    }
  }, [id]);

  const loadCampaign = async (campaignId: string) => {
    setLoading(true);
    try {
      const data = await getCampaign(campaignId);
      setCampaign({
        id: data.id,
        title: data.title,
        content: data.content,
        details: {
          subject: data.subject,
          senderName: data.sender_name,
          senderEmail: data.sender_email,
          subscriberList: data.list_id || "",
        },
      });
    } catch (error) {
      console.error("Error loading campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load campaign",
      });
      navigate("/app/campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setCampaign((prev) => ({ ...prev, title: newTitle }));
  };

  const handleContentChange = (newContent: string) => {
    setCampaign((prev) => ({ ...prev, content: newContent }));
  };

  const handleDetailsChange = (newDetails: any) => {
    setCampaign((prev) => ({ ...prev, details: newDetails }));
  };

  const handleSaveDraft = async (): Promise<string | undefined> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to save campaigns",
      });
      return undefined;
    }

    // Validate campaign data
    const validation = campaignSchema.safeParse({
      title: campaign.title,
      subject: campaign.details.subject,
      sender_name: campaign.details.senderName,
      sender_email: campaign.details.senderEmail,
      content: campaign.content,
      list_id: campaign.details.subscriberList,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: firstError.message,
      });
      return undefined;
    }

    setSaving(true);
    try {
      const campaignData: Partial<Campaign> = {
        title: campaign.title,
        subject: campaign.details.subject,
        sender_name: campaign.details.senderName,
        sender_email: campaign.details.senderEmail,
        content: campaign.content,
        list_id: campaign.details.subscriberList || null,
        status: "draft",
        user_id: user.id,
      };

      if (campaign.id) {
        await updateCampaign(campaign.id, campaignData);
        toast({
          title: "Draft Saved",
          description: "Your campaign has been updated successfully.",
        });
        return campaign.id;
      } else {
        const newCampaign = await createCampaign(campaignData);
        setCampaign((prev) => ({ ...prev, id: newCampaign.id }));
        navigate(`/app/campaigns/${newCampaign.id}`, { replace: true });
        toast({
          title: "Draft Saved",
          description: "Your campaign draft has been saved successfully.",
        });
        return newCampaign.id;
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save campaign. Please try again.",
      });
      return undefined;
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async (scheduledFor: string) => {
    let campaignId = campaign.id;
    if (!campaignId) {
      campaignId = await handleSaveDraft();
    }

    if (!campaignId) return;

    try {
      await updateCampaign(campaignId, {
        status: "scheduled",
        scheduled_for: scheduledFor,
      });
      toast({
        title: "Campaign Scheduled",
        description: "Your campaign has been scheduled successfully.",
      });
      navigate("/app/campaigns");
    } catch (error) {
      console.error("Error scheduling campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule campaign",
      });
    }
  };

  const handleSend = async () => {
    let campaignId = campaign.id;
    if (!campaignId) {
      campaignId = await handleSaveDraft();
    }

    if (!campaignId) return;

    if (!campaign.details.subscriberList) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a subscriber list before sending",
      });
      return;
    }

    try {
      const campaignToSend: Campaign = {
        id: campaignId,
        title: campaign.title,
        subject: campaign.details.subject,
        sender_name: campaign.details.senderName,
        sender_email: campaign.details.senderEmail,
        content: campaign.content,
        list_id: campaign.details.subscriberList,
        status: "sent",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = (await sendCampaign(campaignToSend)) as { sent?: number };
      const sentCount = result.sent ?? 0;

      toast({
        title: "Campaign Sent",
        description: `Your campaign has been sent to ${sentCount} subscribers.`,
      });
      navigate("/app/campaigns");
    } catch (error: unknown) {
      console.error("Error sending campaign:", error);
      const message =
        error instanceof Error ? error.message : "Failed to send campaign. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Loading campaign…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <CampaignHeader
        title={campaign.title}
        onTitleChange={handleTitleChange}
        onSaveDraft={handleSaveDraft}
        onSchedule={handleSchedule}
        onSend={handleSend}
        campaign={campaign}
        saving={saving}
      />
      <div className="min-h-0 flex-1 overflow-hidden">
        <EnhancedCampaignEditor
          onContentChange={handleContentChange}
          onDetailsChange={handleDetailsChange}
          initialContent={campaign.content}
          initialDetails={campaign.details}
        />
      </div>
    </div>
  );
};

export default Home;
