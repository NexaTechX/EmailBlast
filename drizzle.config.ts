import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// DATABASE_URL is the Neon Postgres connection string (server-only secret).
// Used by `drizzle-kit generate` / `drizzle-kit push` — never shipped to the client.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run drizzle-kit");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
