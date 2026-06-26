// Payments are deferred during the Neon migration. The previous Creem flow called
// the Creem API directly from the browser using VITE_CREEM_API_KEY, which exposed
// a secret in the client bundle. Re-enable by adding a Vercel /api function that
// creates the Creem checkout server-side.

interface CreateCheckoutParams {
  productId: string;
}

/** Stub: Creem checkout is disabled until payments are re-enabled server-side. */
export function createCheckoutSession(
  _params: CreateCheckoutParams,
): Promise<void> {
  throw new Error(
    "Payments are temporarily disabled while we finish migrating the backend.",
  );
}
