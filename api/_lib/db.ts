import { neon } from "@neondatabase/serverless";

// Server-side DB access for the /api functions. Uses the privileged
// DATABASE_URL (never shipped to the client) and therefore bypasses RLS — these
// endpoints run for unauthenticated callers (tracking pixels, unsubscribe links,
// provider webhooks), so they must scope writes explicitly in SQL.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(databaseUrl);
