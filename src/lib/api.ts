import { supabase } from "./supabase";
import type {
  Subscriber,
  SubscriberList,
  Campaign,
  CampaignAnalytics,
} from "@/types";

// Subscriber Lists
export async function getSubscriberLists() {
  const { data, error } = await supabase
    .from("subscriber_lists")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as SubscriberList[];
}

export async function createSubscriberList(name: string, description?: string) {
  const { data, error } = await supabase
    .from("subscriber_lists")
    .insert([{ name, description }])
    .select()
    .single();

  if (error) throw error;
  return data as SubscriberList;
}

// Subscribers
export async function getSubscribers(listId: string) {
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .eq("list_id", listId)
    .order("subscribed_at", { ascending: false });

  if (error) throw error;
  return data as Subscriber[];
}

export async function addSubscriber(
  listId: string,
  subscriber: Partial<Subscriber>,
) {
  const { data, error } = await supabase
    .from("subscribers")
    .insert([{ ...subscriber, list_id: listId }])
    .select()
    .single();

  if (error) throw error;
  return data as Subscriber;
}

// Campaigns
export async function getCampaigns() {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Campaign[];
}

export async function createCampaign(campaign: Partial<Campaign>) {
  const { data, error } = await supabase
    .from("campaigns")
    .insert([campaign])
    .select()
    .single();

  if (error) throw error;
  return data as Campaign;
}

export async function updateCampaign(id: string, updates: Partial<Campaign>) {
  const { data, error } = await supabase
    .from("campaigns")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Campaign;
}

// Analytics
export async function getCampaignAnalytics(campaignId: string) {
  const { data, error } = await supabase
    .from("campaign_analytics")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("occurred_at", { ascending: false });

  if (error) throw error;
  return data as CampaignAnalytics[];
}

export async function trackCampaignEvent(event: Partial<CampaignAnalytics>) {
  const { data, error } = await supabase
    .from("campaign_analytics")
    .insert([event])
    .select()
    .single();

  if (error) throw error;
  return data as CampaignAnalytics;
}
