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
  getSubscribers,
} from "@/lib/api";
import { sendCampaign } from "@/lib/brevo";
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
    content: "<p>Start composing your email campaign...</p>",
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

  const handleSaveDraft = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to save campaigns",
      });
      return;
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
      return;
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
        // Update existing campaign
        await updateCampaign(campaign.id, campaignData);
        toast({
          title: "Draft Saved",
          description: "Your campaign has been updated successfully.",
        });
      } else {
        // Create new campaign
        const newCampaign = await createCampaign(campaignData);
        setCampaign((prev) => ({ ...prev, id: newCampaign.id }));
        // Update URL to reflect the new campaign ID
        navigate(`/app/campaigns/${newCampaign.id}`, { replace: true });
        toast({
          title: "Draft Saved",
          description: "Your campaign draft has been saved successfully.",
        });
      }
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

  const handleSchedule = async (scheduledFor: string) => {
    if (!campaign.id) {
      await handleSaveDraft();
    }

    if (campaign.id) {
      try {
        await updateCampaign(campaign.id, {
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
    }
  };

  const handleSend = async () => {
    if (!campaign.id) {
      await handleSaveDraft();
    }

    if (!campaign.details.subscriberList) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a subscriber list before sending",
      });
      return;
    }

    try {
      // Fetch subscribers from the selected list
      const subscribers = await getSubscribers(campaign.details.subscriberList);
      const subscriberEmails = subscribers
        .filter((sub) => !sub.unsubscribed_at)
        .map((sub) => sub.email);

      if (subscriberEmails.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No active subscribers in the selected list",
        });
        return;
      }

      // Send campaign
      const campaignToSend: Campaign = {
        id: campaign.id!,
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

      await sendCampaign(campaignToSend, subscriberEmails);

      // Update campaign status
      await updateCampaign(campaign.id!, {
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      toast({
        title: "Campaign Sent",
        description: `Your campaign has been sent to ${subscriberEmails.length} subscribers.`,
      });
      navigate("/app/campaigns");
    } catch (error) {
      console.error("Error sending campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send campaign. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CampaignHeader
        title={campaign.title}
        onTitleChange={handleTitleChange}
        onSaveDraft={handleSaveDraft}
        onSchedule={handleSchedule}
        onSend={handleSend}
        campaign={campaign}
        saving={saving}
      />

      <div className="flex h-[calc(100vh-72px)]">
        <div className="w-full border-r border-gray-200">
          <EnhancedCampaignEditor
            onContentChange={handleContentChange}
            onDetailsChange={handleDetailsChange}
            initialContent={campaign.content}
            initialDetails={campaign.details}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
