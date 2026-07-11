-- Unique open per campaign+email so pixel/webhook races cannot double-count.
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_analytics_open_unique
  ON campaign_analytics (campaign_id, (lower(email)))
  WHERE event_type = 'open' AND email IS NOT NULL;
--> statement-breakpoint

-- Automation enrollments for drip / welcome sequences.
CREATE TABLE IF NOT EXISTS "automation_enrollments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text DEFAULT auth.user_id() NOT NULL,
  "automation_id" uuid NOT NULL REFERENCES "campaign_automations"("id") ON DELETE cascade,
  "subscriber_id" uuid NOT NULL REFERENCES "subscribers"("id") ON DELETE cascade,
  "current_step" integer DEFAULT 0 NOT NULL,
  "next_run_at" timestamp with time zone DEFAULT now(),
  "status" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint

ALTER TABLE "automation_enrollments" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_automation_enrollments_user_id" ON "automation_enrollments" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_automation_enrollments_next_run" ON "automation_enrollments" ("status", "next_run_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_automation_enrollments_unique"
  ON "automation_enrollments" ("automation_id", "subscriber_id");
--> statement-breakpoint

ALTER TABLE "automation_enrollments"
  ADD CONSTRAINT "automation_enrollments_status_check"
  CHECK ("status" IN ('active', 'completed', 'paused', 'failed'));
--> statement-breakpoint

CREATE POLICY "crud-authenticated-policy-select" ON "automation_enrollments"
  AS PERMISSIVE FOR SELECT TO "authenticated"
  USING ((select auth.user_id() = "automation_enrollments"."user_id"));
--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "automation_enrollments"
  AS PERMISSIVE FOR INSERT TO "authenticated"
  WITH CHECK ((select auth.user_id() = "automation_enrollments"."user_id"));
--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "automation_enrollments"
  AS PERMISSIVE FOR UPDATE TO "authenticated"
  USING ((select auth.user_id() = "automation_enrollments"."user_id"))
  WITH CHECK ((select auth.user_id() = "automation_enrollments"."user_id"));
--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "automation_enrollments"
  AS PERMISSIVE FOR DELETE TO "authenticated"
  USING ((select auth.user_id() = "automation_enrollments"."user_id"));
