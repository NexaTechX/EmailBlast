/** Free-tier caps enforced without billing. */
export const FREE_SUBSCRIBER_LIMIT = 200;
export const FREE_MONTHLY_EMAIL_LIMIT = 100;

export function monthStartIso(d = new Date()): string {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}
