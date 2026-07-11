import { supabase } from "./supabase";
import { FREE_SUBSCRIBER_LIMIT } from "./plan-limits";

/** Count active (non-unsubscribed) subscribers for the current user. */
export async function countActiveSubscribers(): Promise<number> {
  const { count, error } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .is("unsubscribed_at", null);
  if (error) throw error;
  return count ?? 0;
}

/** Count emails sent this calendar month (UTC) for the current user. */
export async function countEmailsSentThisMonth(): Promise<number> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const { data: campaigns, error: cErr } = await supabase
    .from("campaigns")
    .select("id");
  if (cErr) throw cErr;
  const ids = (campaigns || []).map((c) => c.id);
  if (ids.length === 0) return 0;

  const { count, error } = await supabase
    .from("campaign_analytics")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "sent")
    .gte("occurred_at", start.toISOString())
    .in("campaign_id", ids);
  if (error) throw error;
  return count ?? 0;
}

/**
 * Throws if adding `additionalNew` net-new subscribers would exceed the free cap.
 * Upserts of existing emails should pass additionalNew ≈ new-only estimate.
 */
export async function assertCanAddSubscribers(
  additionalNew: number,
): Promise<void> {
  if (additionalNew <= 0) return;
  const used = await countActiveSubscribers();
  if (used + additionalNew > FREE_SUBSCRIBER_LIMIT) {
    const remaining = Math.max(0, FREE_SUBSCRIBER_LIMIT - used);
    throw new Error(
      `Subscriber limit reached (${FREE_SUBSCRIBER_LIMIT}). You can add ${remaining} more.`,
    );
  }
}
