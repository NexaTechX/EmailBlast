# EmailBlast — Supabase → Neon Migration Runbook

This document captures the migration of EmailBlast off Supabase and onto Neon, and
the steps to **deploy** and **verify** it. Work was done on branch
`migrate-supabase-to-neon`.

## What changed

| Concern | Before | After |
|---|---|---|
| Database | Supabase Postgres | **Neon Postgres** |
| Data access (client) | `supabase-js` direct from browser | **Neon Data API** (PostgREST) via `@neondatabase/neon-js` |
| Auth | Supabase Auth | **Neon Auth** (Better Auth) via the `SupabaseAuthAdapter` |
| Email sending | Brevo / SendGrid (key in browser) | **Resend**, called from a server function |
| AI (content + leads) | Google Gemini (hardcoded key in browser) | **Groq**, called from a server function |
| Web scraping | Firecrawl (hardcoded key in browser) | **Firecrawl** via a server proxy |
| Server code | Supabase Edge Functions | **Vercel `/api`** functions |
| Payments | Stripe + Creem (half-built) | **Stubbed** (deferred — see Follow-ups) |

**Security outcome:** no third-party API key ships in the client bundle anymore.
RLS now enforces per-user isolation (previously every authenticated user could
read/write everyone's data).

## Architecture

```
Browser (Vite SPA)
  ├── auth + data  ──►  Neon Data API (PostgREST + RLS)  ──►  Neon Postgres
  │                     (JWT from Neon Auth, injected by neon-js)
  └── fetch('/api/*') ─►  Vercel /api functions (hold all secrets)
                           ├── send / send-test        ─► Resend
                           ├── ai                       ─► Groq
                           ├── scrape                   ─► Firecrawl
                           ├── track/open, unsubscribe  ─► Neon (DATABASE_URL, bypasses RLS)
                           └── webhooks/resend          ─► Neon
```

- Client-direct calls (campaigns, subscribers, leads, profile, analytics reads)
  go through the Data API and are gated by RLS.
- Unauthenticated actions (open-tracking pixel, unsubscribe) and all
  secret-bearing calls run server-side.

## Environment variables

Copy `env.template` → `.env` for local dev. Set the **same** values in the Vercel
project (Settings → Environment Variables) for production.

**Client-side (safe to expose; prefixed `VITE_`):**
- `VITE_NEON_DATA_API_URL` — Neon Data API base, e.g. `https://<ep>.apirest.<region>.aws.neon.tech/neondb/rest/v1`
- `VITE_NEON_AUTH_URL` — Neon Auth URL, e.g. `https://<ep>.neonauth.<region>.aws.neon.tech/neondb/auth`
- `VITE_APP_URL` — app origin (used to build tracking/unsubscribe links). Local: `http://localhost:5173`. Prod: your Vercel URL.

**Server-only secrets (NOT prefixed `VITE_`; never reach the browser):**
- `DATABASE_URL` — Neon Postgres connection string (drizzle migrations + server functions)
- `RESEND_API_KEY`
- `GROQ_API_KEY`
- `FIRECRAWL_API_KEY` — **must be rotated** (see Security)
- `APP_URL` — same as `VITE_APP_URL`; read by the server functions for link building
- `CRON_SECRET` — required in production for `/api/cron/send-scheduled`
- `RESEND_WEBHOOK_SECRET` — required in production for `/api/webhooks/resend`
- `TRACKING_SECRET` — HMAC for signed unsubscribe/tracking links (optional in dev)

> The server functions read `APP_URL || VITE_APP_URL`. Set at least one in Vercel.

## One-time setup (Phase 0)

1. **Neon project** — create it, then enable **Neon Auth** and the **Data API**
   (Project → Data API → Enable). Collect `VITE_NEON_DATA_API_URL`,
   `VITE_NEON_AUTH_URL`, and `DATABASE_URL`.
   - The Data API must be enabled or the schema push fails with
     `schema "auth" does not exist` (RLS depends on `auth.user_id()`).
2. **Resend** — create an account, **verify a sending domain** (DKIM), get
   `RESEND_API_KEY`. Email won't send without a verified domain.
3. **Groq** — get `GROQ_API_KEY` from the Groq console.
4. **Firecrawl** — **rotate** the key (the old one is leaked) and get the new value.
5. **Vercel** — create/link the project; it builds the Vite app and serves `/api`.

## Database — apply the schema

The schema lives in code (`drizzle/schema.ts`) and is applied with drizzle-kit,
not via Supabase migrations. Requires `DATABASE_URL` in `.env`.

```bash
# Generate the SQL migration from schema (offline; already committed as drizzle/migrations/0000_init.sql)
npm run db:generate

# Push the schema + RLS policies to Neon
npm run db:push        # (drizzle-kit push --force)

# Apply SQL migrations (Windows-friendly; no psql required)
npm run db:migrate

# Or apply individual files in the Neon SQL Editor:
# - drizzle/migrations/0001_sent_event_and_auth_grant.sql
# - drizzle/migrations/0002_profile_sending_fields.sql

# Apply the updated_at triggers (drizzle can't express these from schema)
# psql "$DATABASE_URL" -f drizzle/triggers.sql
# (or paste drizzle/triggers.sql into Neon SQL Editor)
```

Expected result: 11 tables, 32 RLS policies, 10 `updated_at` triggers.

> Greenfield only — there is no data migration from the old Supabase DB.

## Build & deploy

```bash
npm install
npm run build          # tsc + vite build — must be clean
```

- `vercel.json` provides the SPA history-fallback that **excludes `/api`** — keep it.
- The `/api` functions are **not** part of the Vite build (`tsconfig.json` only
  includes `src`). Vercel compiles them on deploy. To typecheck them locally:
  ```bash
  npx tsc -p tsconfig.api.json
  ```
- Set all env vars in Vercel, then deploy.

## Verification (Phase 6) — do this after deploy

The build passing does **not** prove the migration works. Run these against the
deployed app:

1. **RLS isolation (the acceptance test).** Sign up as user A → create a campaign
   → read it back. Sign up/log in as user B → confirm B **cannot** see A's
   campaigns, subscribers, or leads. This validates auth + JWT injection + RLS +
   the data round-trip in one test.
2. **Profile auto-creation.** Email/password signup creates a `profiles` row.
   **Google login** also creates one (this was previously broken).
3. **Owner defaults.** Create a campaign without sending `user_id`; confirm it
   saves with the correct owner (the DB default fills it).
4. **Bulk import.** CSV import upserts on `(user_id, email)` without error.
5. **Email + tracking.** Send a campaign via Resend → the open pixel, a click,
   and an unsubscribe all write rows to `campaign_analytics`.
6. **AI + scrape.** The rich-text "AI generate" produces content; lead-finder
   generates/enriches leads; the URL scraper returns data.
7. **No secrets in the bundle.** Confirm the production JS contains no API keys
   (only the Neon Data API/Auth URLs are expected client-side).

## Security — rotate the leaked keys

Two keys were committed to git history; deleting them from source is not enough:
- **Gemini** key `AIzaSyAj0x…` — revoke in Google AI Studio (AI now uses Groq, but the old key is still live in history).
- **Firecrawl** key `fc-01e68c0f…` — revoke in the Firecrawl dashboard and use the new value for `FIRECRAWL_API_KEY`.

## Follow-ups / known limitations

- **Payments deferred.** `src/lib/stripe.ts` and `creem.ts` are stubbed (throw
  "temporarily disabled"). Re-enable by adding `/api` checkout + webhook functions.
- **Beta dependencies.** `@neondatabase/neon-js` and the Neon Data API/Auth are
  beta; the client is isolated in `src/lib/neon.ts` for easy swapping. Fallback:
  `@neondatabase/postgrest-js` + `@neondatabase/serverless`.
- **Naming.** `src/lib/supabase.ts` is now a thin shim re-exporting the Neon
  `client`; `resend.ts` and `groq-api.ts` call the server `/api` routes.
- **`/api/scrape`** is allow-listed to Firecrawl `scrape`/`map`/`search` but is
  unauthenticated; consider verifying the Neon Auth JWT to prevent credit abuse.
- **Bundle size.** The main chunk is ~2 MB (pre-existing); consider code-splitting.
- **Neon Functions** could host the `/api` functions once it leaves private
  preview (currently us-east-2 + new projects only); the handlers would move from
  Vercel's `(req, res)` to web-standard `Request`/`Response` (Hono).

## Key files

- `drizzle/schema.ts`, `drizzle.config.ts`, `drizzle/triggers.sql` — Neon schema + RLS
- `src/lib/neon.ts` — the Neon client (auth + data); `src/lib/supabase.ts` re-exports it
- `src/lib/auth.tsx` — auth provider on Neon Auth (profile upsert on first session)
- `api/` — Vercel functions: `send`, `send-test`, `ai`, `scrape`, `unsubscribe`, `track/open`, `webhooks/resend`, `_lib/{db,tracking}`
- `src/lib/{resend,groq-api,firecrawl,scrape-api}.ts` — client wrappers that POST to `/api`
- `vercel.json` — SPA routing
