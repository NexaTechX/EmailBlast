import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// DATABASE_URL is the Neon Postgres connection string (server-only secret).
// Used by `drizzle-kit generate` / `drizzle-kit push` — never shipped to the client.
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
