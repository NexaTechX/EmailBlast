export interface Subscriber {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  metadata?: Record<string, any>;
  subscribed_at: string;
  unsubscribed_at?: string;
  tags?: string[];
  engagement_score?: number;
}

export interface SubscriberList {
  id: string;
  name: string;
  description?: string;
  total_subscribers: number;
  created_at: string;
  engagement_rate?: number;
}

export interface Campaign {
  id: string;
  title: string;
  subject: string;
  sender_name: string;
  sender_email: string;
  content: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  list_id: string;
  is_cold_outreach?: boolean;
  automation_enabled?: boolean;
  metadata?: {
    ai_optimized?: boolean;
    template_id?: string;
    campaign_type?:
      | "newsletter"
      | "promotional"
      | "transactional"
      | "cold_outreach";
  };
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  event_type: "open" | "click" | "bounce" | "unsubscribe" | "conversion";
  occurred_at: string;
  metadata?: Record<string, any>;
  subscriber_id?: string;
  email?: string;
  device_info?: {
    device_type?: string;
    browser?: string;
    os?: string;
  };
  location_info?: {
    country?: string;
    city?: string;
  };
}

export interface CampaignAutomation {
  id: string;
  campaign_id: string;
  name: string;
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  status: "active" | "paused" | "draft";
  created_at: string;
  updated_at: string;
}

export interface AutomationTrigger {
  type: "open" | "click" | "no_open" | "form_submit" | "custom";
  condition?: string;
  metadata?: Record<string, any>;
}

export interface AutomationAction {
  type:
    | "send_email"
    | "wait"
    | "add_tag"
    | "add_to_list"
    | "notify"
    | "webhook";
  details: Record<string, any>;
  delay?: number; // in seconds
}

export interface ColdOutreachSequence {
  id: string;
  campaign_id: string;
  name: string;
  emails: ColdOutreachEmail[];
  calls?: ColdOutreachCall[];
  status: "active" | "paused" | "completed";
  created_at: string;
  updated_at: string;
}

export interface ColdOutreachEmail {
  id: string;
  subject: string;
  content: string;
  delay?: number; // in seconds after previous step
  condition?: "no_reply" | "no_open" | "always";
  metadata?: Record<string, any>;
}

export interface ColdOutreachCall {
  id: string;
  script?: string;
  scheduled_after?: string; // email_id or specific date
  delay?: number; // in seconds after previous step
  condition?: "no_reply" | "no_open" | "always";
  metadata?: Record<string, any>;
}
