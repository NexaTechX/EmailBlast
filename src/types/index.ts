export interface Subscriber {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  metadata?: Record<string, any>;
  subscribed_at: string;
  unsubscribed_at?: string;
}

export interface SubscriberList {
  id: string;
  name: string;
  description?: string;
  total_subscribers: number;
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  subject: string;
  sender_name: string;
  sender_email: string;
  content: string;
  status: "draft" | "scheduled" | "sent";
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  list_id: string;
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  event_type: "open" | "click" | "bounce" | "unsubscribe";
  occurred_at: string;
  metadata?: Record<string, any>;
  subscriber_id?: string;
}
