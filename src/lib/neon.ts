import { createClient, SupabaseAuthAdapter } from "@neondatabase/neon-js";

// Single Neon client for BOTH auth (Neon Auth / Better Auth) and data (Neon Data
// API / PostgREST). We use the SupabaseAuthAdapter so the auth + query surface
// matches the supabase-js API the app was built on (`client.auth.signInWithPassword`,
// `client.from(...).select()`), keeping the migration a near drop-in.
//
// The Data API URL and Auth URL are public (RLS enforces access); real secrets
// live only in the Vercel /api server functions. Beta SDK — isolated here so a
// future API change touches one file.
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL || "";
const authUrl = import.meta.env.VITE_NEON_AUTH_URL || "";

export const client = createClient({
  auth: {
    adapter: SupabaseAuthAdapter(),
    url: authUrl,
  },
  dataApi: {
    url: dataApiUrl,
  },
});
