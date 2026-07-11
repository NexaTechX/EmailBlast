import { sql } from "./db";

/** Free-tier caps (no billing). Keep in sync with src/lib/plan-limits.ts */
export const FREE_SUBSCRIBER_LIMIT = 200;
export const FREE_MONTHLY_EMAIL_LIMIT = 100;

export async function countActiveSubscribers(userId: string): Promise<number> {
  const rows = await sql`
    select count(*)::int as count from subscribers
    where user_id = ${userId} and unsubscribed_at is null
  `;
  return (rows[0] as { count: number }).count ?? 0;
}

export async function countEmailsSentThisMonth(userId: string): Promise<number> {
  const rows = await sql`
    select count(*)::int as count
    from campaign_analytics ca
    join campaigns c on c.id = ca.campaign_id
    where c.user_id = ${userId}
      and ca.event_type = 'sent'
      and ca.occurred_at >= date_trunc('month', now())
  `;
  return (rows[0] as { count: number }).count ?? 0;
}

/** Throws a user-facing Error if sending `additional` would exceed the monthly cap. */
export async function assertCanSendEmails(
  userId: string,
  additional: number,
): Promise<void> {
  const used = await countEmailsSentThisMonth(userId);
  if (used + additional > FREE_MONTHLY_EMAIL_LIMIT) {
    const remaining = Math.max(0, FREE_MONTHLY_EMAIL_LIMIT - used);
    throw new Error(
      `Monthly send limit reached (${FREE_MONTHLY_EMAIL_LIMIT} emails). You have ${remaining} remaining this month.`,
    );
  }
}
