CREATE TABLE "ab_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"name" text NOT NULL,
	"variants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text NOT NULL,
	"winner_variant_id" text,
	"winner_metric" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ab_tests_status_check" CHECK ("ab_tests"."status" in ('draft','running','completed','paused'))
);
--> statement-breakpoint
ALTER TABLE "ab_tests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "campaign_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"subscriber_id" uuid,
	"email" text,
	"event_type" text NOT NULL,
	"metadata" jsonb,
	"device_info" jsonb,
	"location_info" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "campaign_analytics_event_type_check" CHECK ("campaign_analytics"."event_type" in ('open','click','bounce','unsubscribe','conversion'))
);
--> statement-breakpoint
ALTER TABLE "campaign_analytics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "campaign_automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"name" text NOT NULL,
	"triggers" jsonb DEFAULT '[]'::jsonb,
	"actions" jsonb DEFAULT '[]'::jsonb,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "campaign_automations_status_check" CHECK ("campaign_automations"."status" in ('active','paused','draft'))
);
--> statement-breakpoint
ALTER TABLE "campaign_automations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT auth.user_id() NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"sender_name" text NOT NULL,
	"sender_email" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"list_id" uuid,
	"scheduled_for" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"is_cold_outreach" boolean DEFAULT false,
	"automation_enabled" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "campaigns_status_check" CHECK ("campaigns"."status" in ('draft','scheduled','sending','sent','failed'))
);
--> statement-breakpoint
ALTER TABLE "campaigns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cold_outreach_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"name" text NOT NULL,
	"emails" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"calls" jsonb DEFAULT '[]'::jsonb,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "cold_outreach_sequences_status_check" CHECK ("cold_outreach_sequences"."status" in ('active','paused','completed'))
);
--> statement-breakpoint
ALTER TABLE "cold_outreach_sequences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT auth.user_id() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"category" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "email_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text DEFAULT auth.user_id() NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"company" text,
	"email" text NOT NULL,
	"phone" text,
	"linkedin" text,
	"website" text,
	"industry" text,
	"employees" text,
	"location" text,
	"personal_email" text,
	"direct_phone" text,
	"mobile" text,
	"education" text,
	"previous_companies" text[],
	"technologies" text[],
	"founded" text,
	"revenue" text,
	"company_size" text,
	"interests" text[],
	"confidence_score" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "leads_user_email_key" UNIQUE("user_id","email")
);
--> statement-breakpoint
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY DEFAULT auth.user_id() NOT NULL,
	"full_name" text,
	"company_name" text,
	"website" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriber_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT auth.user_id() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"total_subscribers" integer DEFAULT 0,
	"engagement_rate" numeric(5, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "subscriber_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT auth.user_id() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"list_id" uuid,
	"tags" text[],
	"metadata" jsonb,
	"engagement_score" numeric(5, 2) DEFAULT '0',
	"subscribed_at" timestamp with time zone DEFAULT now(),
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "subscribers_user_email_key" UNIQUE("user_id","email")
);
--> statement-breakpoint
ALTER TABLE "subscribers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT auth.user_id() NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"marketing_emails" boolean DEFAULT false,
	"weekly_digest" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_preferences_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ab_tests" ADD CONSTRAINT "ab_tests_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_analytics" ADD CONSTRAINT "campaign_analytics_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_analytics" ADD CONSTRAINT "campaign_analytics_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_automations" ADD CONSTRAINT "campaign_automations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_list_id_subscriber_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."subscriber_lists"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cold_outreach_sequences" ADD CONSTRAINT "cold_outreach_sequences_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_list_id_subscriber_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."subscriber_lists"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ab_tests_campaign_id" ON "ab_tests" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_campaign_analytics_campaign_id" ON "campaign_analytics" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_campaign_analytics_event_type" ON "campaign_analytics" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_campaign_analytics_occurred_at" ON "campaign_analytics" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "idx_campaign_analytics_subscriber_id" ON "campaign_analytics" USING btree ("subscriber_id");--> statement-breakpoint
CREATE INDEX "idx_campaign_automations_campaign_id" ON "campaign_automations" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_campaigns_user_id" ON "campaigns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_campaigns_status" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_campaigns_list_id" ON "campaigns" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "idx_cold_outreach_sequences_campaign_id" ON "cold_outreach_sequences" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_email_templates_user_id" ON "email_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_leads_company" ON "leads" USING btree ("company");--> statement-breakpoint
CREATE INDEX "idx_subscriber_lists_user_id" ON "subscriber_lists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscribers_list_id" ON "subscribers" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "idx_subscribers_subscribed_at" ON "subscribers" USING btree ("subscribed_at");--> statement-breakpoint
CREATE POLICY "campaign_owner_all" ON "ab_tests" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from "campaigns" where "campaigns"."id" = "ab_tests"."campaign_id" and "campaigns"."user_id" = auth.user_id()));--> statement-breakpoint
CREATE POLICY "analytics_owner_read" ON "campaign_analytics" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from "campaigns" where "campaigns"."id" = "campaign_analytics"."campaign_id" and "campaigns"."user_id" = auth.user_id()));--> statement-breakpoint
CREATE POLICY "campaign_owner_all" ON "campaign_automations" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from "campaigns" where "campaigns"."id" = "campaign_automations"."campaign_id" and "campaigns"."user_id" = auth.user_id()));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "campaigns" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "campaigns"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "campaigns" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "campaigns"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "campaigns" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "campaigns"."user_id")) WITH CHECK ((select auth.user_id() = "campaigns"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "campaigns" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "campaigns"."user_id"));--> statement-breakpoint
CREATE POLICY "campaign_owner_all" ON "cold_outreach_sequences" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from "campaigns" where "campaigns"."id" = "cold_outreach_sequences"."campaign_id" and "campaigns"."user_id" = auth.user_id()));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "email_templates" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "email_templates"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "email_templates" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "email_templates"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "email_templates" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "email_templates"."user_id")) WITH CHECK ((select auth.user_id() = "email_templates"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "email_templates" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "email_templates"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "leads" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "leads"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "leads" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "leads"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "leads" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "leads"."user_id")) WITH CHECK ((select auth.user_id() = "leads"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "leads" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "leads"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "profiles"."id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "profiles"."id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "profiles"."id")) WITH CHECK ((select auth.user_id() = "profiles"."id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "profiles" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "profiles"."id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "subscriber_lists" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "subscriber_lists"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "subscriber_lists" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "subscriber_lists"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "subscriber_lists" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "subscriber_lists"."user_id")) WITH CHECK ((select auth.user_id() = "subscriber_lists"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "subscriber_lists" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "subscriber_lists"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "subscribers" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "subscribers"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "subscribers" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "subscribers"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "subscribers" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "subscribers"."user_id")) WITH CHECK ((select auth.user_id() = "subscribers"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "subscribers" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "subscribers"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "user_preferences" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "user_preferences"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "user_preferences" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "user_preferences"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "user_preferences" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "user_preferences"."user_id")) WITH CHECK ((select auth.user_id() = "user_preferences"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "user_preferences" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "user_preferences"."user_id"));