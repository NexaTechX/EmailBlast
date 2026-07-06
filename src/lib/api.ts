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

export async function updateSubscriberList(
  id: string,
  updates: { name?: string; description?: string },
) {
  const { data, error } = await supabase
    .from("subscriber_lists")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as SubscriberList;
}

export async function deleteSubscriberList(id: string) {
  const { error } = await supabase
    .from("subscriber_lists")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/** Creates "My Subscribers" if the user has no lists yet. */
export async function ensureDefaultSubscriberList(): Promise<SubscriberList | null> {
  const lists = await getSubscriberLists();
  if (lists.length > 0) return lists[0];
  return createSubscriberList("My Subscribers", "Default subscriber list");
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

export async function getCampaign(id: string) {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
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

export async function deleteCampaign(id: string) {
  const { error } = await supabase.from("campaigns").delete().eq("id", id);

  if (error) throw error;
}

// Analytics — use analytics-utils for reads; server writes via /api routes.
export async function getCampaignAnalyticsFromApi(campaignId: string) {
  const { data, error } = await supabase
    .from("campaign_analytics")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("occurred_at", { ascending: false });

  if (error) throw error;
  return data as CampaignAnalytics[];
}
