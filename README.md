# EmailBlast - Email Marketing Platform

A full-featured email marketing platform built with React, TypeScript, Neon Postgres, and Resend.

## Features

- **Campaign Management** — Create, edit, schedule, and send email campaigns with a rich text editor
- **Subscriber Management** — Import subscribers via CSV, export lists, manage unsubscribes
- **Analytics Dashboard** — Track sends, opens, clicks, bounces, and unsubscribes
- **A/B Testing** — Test subject line variants and apply winners
- **AI Content Generation** — Groq-powered email copy and lead suggestions (server-side)
- **Lead Finder** — Firecrawl web scraping + Groq lead generation
- **Compliance Checker** — Rules-based CAN-SPAM/GDPR checks in the campaign editor
- **Authentication** — Neon Auth with email verification
- **Dark Mode** — Built-in theme support

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind, shadcn/ui |
| Database | Neon Postgres + Drizzle ORM |
| Auth & Data API | Neon Auth + Neon Data API (`@neondatabase/neon-js`) |
| Email | Resend (via Vercel `/api/send`) |
| AI | Groq (via `/api/ai`) |
| Scraping | Firecrawl (via `/api/scrape`) |
| Hosting | Vercel (SPA + serverless API routes) |

## Quick Start

### 1. Install

```bash
git clone <your-repo-url>
cd EmailBlast
npm install
```

### 2. Environment variables

Copy `env.template` to `.env` and fill in values:

```bash
cp env.template .env
```

Required client vars:
- `VITE_NEON_DATA_API_URL`
- `VITE_NEON_AUTH_URL`
- `VITE_APP_URL`

Required server vars (Vercel / local API):
- `DATABASE_URL`
- `RESEND_API_KEY`
- `GROQ_API_KEY` (optional, for AI)
- `FIRECRAWL_API_KEY` (optional, for lead scraping)

### 3. Database

```bash
npm run db:push
psql "$DATABASE_URL" -f drizzle/triggers.sql
psql "$DATABASE_URL" -f drizzle/migrations/0001_sent_event_and_auth_grant.sql
```

### 4. Development

The Vite dev server serves the SPA only. To test `/api` routes locally:

```bash
# Terminal 1 — frontend
npm run dev

# Terminal 2 — API routes (recommended)
npm run dev:api
```

Or deploy to Vercel and use preview URLs for full end-to-end testing.

### 5. Build

```bash
npm run build
```

## Project Structure

```
EmailBlast/
├── api/                 # Vercel serverless functions (send, track, ai, scrape, cron)
├── drizzle/             # Schema + migrations
├── src/
│   ├── components/      # UI components
│   ├── lib/             # Client helpers (auth, api, brevo→Resend proxy)
│   └── pages/           # Route pages
└── env.template         # Environment variable reference
```

## Deployment (Vercel)

1. Push to GitHub and import in Vercel
2. Add all env vars from `env.template`
3. Deploy — cron runs `/api/cron/send-scheduled` every 5 minutes for scheduled campaigns
4. Configure Resend webhook → `https://your-domain/api/webhooks/resend` with `RESEND_WEBHOOK_SECRET`

## Payments

Paid plans are deferred. Subscription settings show a "coming soon" state; all features run on the Free tier for now.

## License

[Your License Here]
