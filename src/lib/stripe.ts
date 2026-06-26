// Payments are deferred during the Neon migration. The previous Stripe flow
// invoked Supabase Edge Functions (create-checkout-session / create-portal-session)
// that do not exist in this repo. Re-enable by adding Vercel /api functions that
// create the Stripe session server-side, then wire these up again.

const PAYMENTS_DISABLED =
  "Payments are temporarily disabled while we finish migrating the backend.";

export async function createCheckoutSession(_priceId: string): Promise<void> {
  throw new Error(PAYMENTS_DISABLED);
}

export async function createPortalSession(): Promise<void> {
  throw new Error(PAYMENTS_DISABLED);
}
