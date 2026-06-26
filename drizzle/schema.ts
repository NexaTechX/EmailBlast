import { sql } from "drizzle-orm";
import { authUid, authenticatedRole, crudPolicy } from "drizzle-orm/neon";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Neon Auth user ids are opaque strings (Better Auth), not uuids.
// Owner columns are TEXT and default to `auth.user_id()` so the Data API
// fills them from the JWT — clients must OMIT the column on insert.
const ownerId = () =>
  text("user_id")
    .notNull()
    .default(sql`auth.user_id()`);

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow();
const updatedAt = timestamp("updated_at", { withTimezone: true }).defaultNow();

// ---------------------------------------------------------------------------
// profiles — one row per user; id IS the auth user id
// ---------------------------------------------------------------------------
export const profiles = pgTable(
  "profiles",
  {
    id: text("id")
      .primaryKey()
      .default(sql`auth.user_id()`),
    fullName: text("full_name"),
    companyName: text("company_name"),
    website: text("website"),
    createdAt,
    updatedAt,
  },
  (t) => [
    crudPolicy({
      role: authenticatedRole,
      read: authUid(t.id),
      modify: authUid(t.id),
    }),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// subscriber_lists
// ---------------------------------------------------------------------------
export const subscriberLists = pgTable(
  "subscriber_lists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: ownerId(),
    name: text("name").notNull(),
    description: text("description"),
    totalSubscribers: integer("total_subscribers").default(0),
    engagementRate: numeric("engagement_rate", { precision: 5, scale: 2 }).default("0"),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("idx_subscriber_lists_user_id").on(t.userId),
    crudPolicy({
      role: authenticatedRole,
      read: authUid(t.userId),
      modify: authUid(t.userId),
    }),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// subscribers — gained a user_id owner column + composite unique(user_id,email)
// ---------------------------------------------------------------------------
export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: ownerId(),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    listId: uuid("list_id").references(() => subscriberLists.id, {
      onDelete: "set null",
    }),
    tags: text("tags").array(),
    metadata: jsonb("metadata"),
    engagementScore: numeric("engagement_score", { precision: 5, scale: 2 }).default("0"),
    subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (t) => [
    unique("subscribers_user_email_key").on(t.userId, t.email),
    index("idx_subscribers_list_id").on(t.listId),
    index("idx_subscribers_subscribed_at").on(t.subscribedAt),
    crudPolicy({
      role: authenticatedRole,
      read: authUid(t.userId),
      modify: authUid(t.userId),
    }),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// email_templates
// ---------------------------------------------------------------------------
export const emailTemplates = pgTable(
  "email_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: ownerId(),
    name: text("name").notNull(),
    description: text("description"),
    content: text("content").notNull(),
    category: text("category"),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("idx_email_templates_user_id").on(t.userId),
    crudPolicy({
      role: authenticatedRole,
      read: authUid(t.userId),
      modify: authUid(t.userId),
    }),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// campaigns
// ---------------------------------------------------------------------------
export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: ownerId(),
    title: text("title").notNull(),
    subject: text("subject").notNull(),
    senderName: text("sender_name").notNull(),
    senderEmail: text("sender_email").notNull(),
    content: text("content").notNull(),
    status: text("status").notNull().default("draft"),
    listId: uuid("list_id").references(() => subscriberLists.id, {
      onDelete: "set null",
    }),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    isColdOutreach: boolean("is_cold_outreach").default(false),
    automationEnabled: boolean("automation_enabled").default(false),
    metadata: jsonb("metadata"),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("idx_campaigns_user_id").on(t.userId),
    index("idx_campaigns_status").on(t.status),
    index("idx_campaigns_list_id").on(t.listId),
    crudPolicy({
      role: authenticatedRole,
      read: authUid(t.userId),
      modify: authUid(t.userId),
    }),
    check(
      "campaigns_status_check",
      sql`${t.status} in ('draft','scheduled','sending','sent','failed')`,
    ),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// campaign_analytics — owned via campaign_id -> campaigns.user_id.
// Reads only for the owner; writes happen server-side (bypassing RLS).
// ---------------------------------------------------------------------------
export const campaignAnalytics = pgTable(
  "campaign_analytics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id").references(() => campaigns.id, {
      onDelete: "cascade",
    }),
    subscriberId: uuid("subscriber_id").references(() => subscribers.id, {
      onDelete: "set null",
    }),
    email: text("email"),
    eventType: text("event_type").notNull(),
    metadata: jsonb("metadata"),
    deviceInfo: jsonb("device_info"),
    locationInfo: jsonb("location_info"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("idx_campaign_analytics_campaign_id").on(t.campaignId),
    index("idx_campaign_analytics_event_type").on(t.eventType),
    index("idx_campaign_analytics_occurred_at").on(t.occurredAt),
    index("idx_campaign_analytics_subscriber_id").on(t.subscriberId),
    pgPolicy("analytics_owner_read", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (select 1 from ${campaigns} where ${campaigns.id} = ${t.campaignId} and ${campaigns.userId} = auth.user_id())`,
    }),
    check(
      "campaign_analytics_event_type_check",
      sql`${t.eventType} in ('open','click','bounce','unsubscribe','conversion')`,
    ),
  ],
).enableRLS();

// Campaign-owned child tables: full access only to the campaign's owner.
const campaignChildPolicy = (campaignIdCol: any) =>
  pgPolicy("campaign_owner_all", {
    for: "all",
    to: authenticatedRole,
    using: sql`exists (select 1 from ${campaigns} where ${campaigns.id} = ${campaignIdCol} and ${campaigns.userId} = auth.user_id())`,
  });

// ---------------------------------------------------------------------------
// campaign_automations
// ---------------------------------------------------------------------------
export const campaignAutomations = pgTable(
  "campaign_automations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id").references(() => campaigns.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    triggers: jsonb("triggers").default(sql`'[]'::jsonb`),
    actions: jsonb("actions").default(sql`'[]'::jsonb`),
    status: text("status").notNull(),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("idx_campaign_automations_campaign_id").on(t.campaignId),
    campaignChildPolicy(t.campaignId),
    check(
      "campaign_automations_status_check",
      sql`${t.status} in ('active','paused','draft')`,
    ),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// cold_outreach_sequences
// ---------------------------------------------------------------------------
export const coldOutreachSequences = pgTable(
  "cold_outreach_sequences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id").references(() => campaigns.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    emails: jsonb("emails").default(sql`'[]'::jsonb`).notNull(),
    calls: jsonb("calls").default(sql`'[]'::jsonb`),
    status: text("status").notNull(),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("idx_cold_outreach_sequences_campaign_id").on(t.campaignId),
    campaignChildPolicy(t.campaignId),
    check(
      "cold_outreach_sequences_status_check",
      sql`${t.status} in ('active','paused','completed')`,
    ),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// ab_tests
// ---------------------------------------------------------------------------
export const abTests = pgTable(
  "ab_tests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id").references(() => campaigns.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    variants: jsonb("variants").default(sql`'[]'::jsonb`).notNull(),
    status: text("status").notNull(),
    winnerVariantId: text("winner_variant_id"),
    winnerMetric: text("winner_metric"),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("idx_ab_tests_campaign_id").on(t.campaignId),
    campaignChildPolicy(t.campaignId),
    check(
      "ab_tests_status_check",
      sql`${t.status} in ('draft','running','completed','paused')`,
    ),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// leads — gained a user_id owner column + composite unique(user_id,email)
// ---------------------------------------------------------------------------
export const leads = pgTable(
  "leads",
  {
    id: text("id").primaryKey(),
    userId: ownerId(),
    name: text("name").notNull(),
    title: text("title"),
    company: text("company"),
    email: text("email").notNull(),
    phone: text("phone"),
    linkedin: text("linkedin"),
    website: text("website"),
    industry: text("industry"),
    employees: text("employees"),
    location: text("location"),
    personalEmail: text("personal_email"),
    directPhone: text("direct_phone"),
    mobile: text("mobile"),
    education: text("education"),
    previousCompanies: text("previous_companies").array(),
    technologies: text("technologies").array(),
    founded: text("founded"),
    revenue: text("revenue"),
    companySize: text("company_size"),
    interests: text("interests").array(),
    confidenceScore: integer("confidence_score"),
    createdAt,
    updatedAt,
  },
  (t) => [
    unique("leads_user_email_key").on(t.userId, t.email),
    index("idx_leads_company").on(t.company),
    crudPolicy({
      role: authenticatedRole,
      read: authUid(t.userId),
      modify: authUid(t.userId),
    }),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// user_preferences — new table (the app upserted to a table that never existed)
// ---------------------------------------------------------------------------
export const userPreferences = pgTable(
  "user_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: ownerId(),
    emailNotifications: boolean("email_notifications").default(true),
    marketingEmails: boolean("marketing_emails").default(false),
    weeklyDigest: boolean("weekly_digest").default(true),
    createdAt,
    updatedAt,
  },
  (t) => [
    unique("user_preferences_user_id_key").on(t.userId),
    crudPolicy({
      role: authenticatedRole,
      read: authUid(t.userId),
      modify: authUid(t.userId),
    }),
  ],
).enableRLS();
