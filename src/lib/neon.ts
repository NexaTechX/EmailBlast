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
    // `credentials: "include"` makes Neon Auth (Better Auth) send/receive its
    // session cookie cross-origin — without it the getSession() that runs right
    // after signIn/signUp comes back empty ("Failed to retrieve user session").
    adapter: SupabaseAuthAdapter({ fetchOptions: { credentials: "include" } }),
    url: authUrl,
  },
  dataApi: {
    url: dataApiUrl,
  },
});
