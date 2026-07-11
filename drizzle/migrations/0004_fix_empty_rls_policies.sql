-- Recreate RLS policies that were applied empty by an earlier drizzle-kit push.
-- Empty USING/WITH CHECK expressions block all writes (42501) for authenticated users.

-- profiles (owner column = id)
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON public.profiles;
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON public.profiles;
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON public.profiles;
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON public.profiles;
CREATE POLICY "crud-authenticated-policy-select" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING ((select auth.user_id() = profiles.id));
CREATE POLICY "crud-authenticated-policy-insert" ON public.profiles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((select auth.user_id() = profiles.id));
CREATE POLICY "crud-authenticated-policy-update" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING ((select auth.user_id() = profiles.id)) WITH CHECK ((select auth.user_id() = profiles.id));
CREATE POLICY "crud-authenticated-policy-delete" ON public.profiles AS PERMISSIVE FOR DELETE TO authenticated USING ((select auth.user_id() = profiles.id));

-- subscriber_lists
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON public.subscriber_lists;
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON public.subscriber_lists;
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON public.subscriber_lists;
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON public.subscriber_lists;
CREATE POLICY "crud-authenticated-policy-select" ON public.subscriber_lists AS PERMISSIVE FOR SELECT TO authenticated USING ((select auth.user_id() = subscriber_lists.user_id));
CREATE POLICY "crud-authenticated-policy-insert" ON public.subscriber_lists AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((select auth.user_id() = subscriber_lists.user_id));
CREATE POLICY "crud-authenticated-policy-update" ON public.subscriber_lists AS PERMISSIVE FOR UPDATE TO authenticated USING ((select auth.user_id() = subscriber_lists.user_id)) WITH CHECK ((select auth.user_id() = subscriber_lists.user_id));
CREATE POLICY "crud-authenticated-policy-delete" ON public.subscriber_lists AS PERMISSIVE FOR DELETE TO authenticated USING ((select auth.user_id() = subscriber_lists.user_id));

-- subscribers
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON public.subscribers;
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON public.subscribers;
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON public.subscribers;
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON public.subscribers;
CREATE POLICY "crud-authenticated-policy-select" ON public.subscribers AS PERMISSIVE FOR SELECT TO authenticated USING ((select auth.user_id() = subscribers.user_id));
CREATE POLICY "crud-authenticated-policy-insert" ON public.subscribers AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((select auth.user_id() = subscribers.user_id));
CREATE POLICY "crud-authenticated-policy-update" ON public.subscribers AS PERMISSIVE FOR UPDATE TO authenticated USING ((select auth.user_id() = subscribers.user_id)) WITH CHECK ((select auth.user_id() = subscribers.user_id));
CREATE POLICY "crud-authenticated-policy-delete" ON public.subscribers AS PERMISSIVE FOR DELETE TO authenticated USING ((select auth.user_id() = subscribers.user_id));

-- email_templates
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON public.email_templates;
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON public.email_templates;
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON public.email_templates;
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON public.email_templates;
CREATE POLICY "crud-authenticated-policy-select" ON public.email_templates AS PERMISSIVE FOR SELECT TO authenticated USING ((select auth.user_id() = email_templates.user_id));
CREATE POLICY "crud-authenticated-policy-insert" ON public.email_templates AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((select auth.user_id() = email_templates.user_id));
CREATE POLICY "crud-authenticated-policy-update" ON public.email_templates AS PERMISSIVE FOR UPDATE TO authenticated USING ((select auth.user_id() = email_templates.user_id)) WITH CHECK ((select auth.user_id() = email_templates.user_id));
CREATE POLICY "crud-authenticated-policy-delete" ON public.email_templates AS PERMISSIVE FOR DELETE TO authenticated USING ((select auth.user_id() = email_templates.user_id));

-- campaigns
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON public.campaigns;
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON public.campaigns;
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON public.campaigns;
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON public.campaigns;
CREATE POLICY "crud-authenticated-policy-select" ON public.campaigns AS PERMISSIVE FOR SELECT TO authenticated USING ((select auth.user_id() = campaigns.user_id));
CREATE POLICY "crud-authenticated-policy-insert" ON public.campaigns AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((select auth.user_id() = campaigns.user_id));
CREATE POLICY "crud-authenticated-policy-update" ON public.campaigns AS PERMISSIVE FOR UPDATE TO authenticated USING ((select auth.user_id() = campaigns.user_id)) WITH CHECK ((select auth.user_id() = campaigns.user_id));
CREATE POLICY "crud-authenticated-policy-delete" ON public.campaigns AS PERMISSIVE FOR DELETE TO authenticated USING ((select auth.user_id() = campaigns.user_id));

-- leads
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON public.leads;
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON public.leads;
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON public.leads;
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON public.leads;
CREATE POLICY "crud-authenticated-policy-select" ON public.leads AS PERMISSIVE FOR SELECT TO authenticated USING ((select auth.user_id() = leads.user_id));
CREATE POLICY "crud-authenticated-policy-insert" ON public.leads AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((select auth.user_id() = leads.user_id));
CREATE POLICY "crud-authenticated-policy-update" ON public.leads AS PERMISSIVE FOR UPDATE TO authenticated USING ((select auth.user_id() = leads.user_id)) WITH CHECK ((select auth.user_id() = leads.user_id));
CREATE POLICY "crud-authenticated-policy-delete" ON public.leads AS PERMISSIVE FOR DELETE TO authenticated USING ((select auth.user_id() = leads.user_id));

-- user_preferences
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON public.user_preferences;
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON public.user_preferences;
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON public.user_preferences;
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON public.user_preferences;
CREATE POLICY "crud-authenticated-policy-select" ON public.user_preferences AS PERMISSIVE FOR SELECT TO authenticated USING ((select auth.user_id() = user_preferences.user_id));
CREATE POLICY "crud-authenticated-policy-insert" ON public.user_preferences AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((select auth.user_id() = user_preferences.user_id));
CREATE POLICY "crud-authenticated-policy-update" ON public.user_preferences AS PERMISSIVE FOR UPDATE TO authenticated USING ((select auth.user_id() = user_preferences.user_id)) WITH CHECK ((select auth.user_id() = user_preferences.user_id));
CREATE POLICY "crud-authenticated-policy-delete" ON public.user_preferences AS PERMISSIVE FOR DELETE TO authenticated USING ((select auth.user_id() = user_preferences.user_id));

-- automation_enrollments
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON public.automation_enrollments;
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON public.automation_enrollments;
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON public.automation_enrollments;
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON public.automation_enrollments;
CREATE POLICY "crud-authenticated-policy-select" ON public.automation_enrollments AS PERMISSIVE FOR SELECT TO authenticated USING ((select auth.user_id() = automation_enrollments.user_id));
CREATE POLICY "crud-authenticated-policy-insert" ON public.automation_enrollments AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((select auth.user_id() = automation_enrollments.user_id));
CREATE POLICY "crud-authenticated-policy-update" ON public.automation_enrollments AS PERMISSIVE FOR UPDATE TO authenticated USING ((select auth.user_id() = automation_enrollments.user_id)) WITH CHECK ((select auth.user_id() = automation_enrollments.user_id));
CREATE POLICY "crud-authenticated-policy-delete" ON public.automation_enrollments AS PERMISSIVE FOR DELETE TO authenticated USING ((select auth.user_id() = automation_enrollments.user_id));

-- Campaign-owned child tables
DROP POLICY IF EXISTS "campaign_owner_all" ON public.ab_tests;
CREATE POLICY "campaign_owner_all" ON public.ab_tests AS PERMISSIVE FOR ALL TO authenticated USING (exists (select 1 from campaigns where campaigns.id = ab_tests.campaign_id and campaigns.user_id = auth.user_id())) WITH CHECK (exists (select 1 from campaigns where campaigns.id = ab_tests.campaign_id and campaigns.user_id = auth.user_id()));

DROP POLICY IF EXISTS "campaign_owner_all" ON public.campaign_automations;
CREATE POLICY "campaign_owner_all" ON public.campaign_automations AS PERMISSIVE FOR ALL TO authenticated USING (exists (select 1 from campaigns where campaigns.id = campaign_automations.campaign_id and campaigns.user_id = auth.user_id())) WITH CHECK (exists (select 1 from campaigns where campaigns.id = campaign_automations.campaign_id and campaigns.user_id = auth.user_id()));

DROP POLICY IF EXISTS "campaign_owner_all" ON public.cold_outreach_sequences;
CREATE POLICY "campaign_owner_all" ON public.cold_outreach_sequences AS PERMISSIVE FOR ALL TO authenticated USING (exists (select 1 from campaigns where campaigns.id = cold_outreach_sequences.campaign_id and campaigns.user_id = auth.user_id())) WITH CHECK (exists (select 1 from campaigns where campaigns.id = cold_outreach_sequences.campaign_id and campaigns.user_id = auth.user_id()));

DROP POLICY IF EXISTS "analytics_owner_read" ON public.campaign_analytics;
CREATE POLICY "analytics_owner_read" ON public.campaign_analytics AS PERMISSIVE FOR SELECT TO authenticated USING (exists (select 1 from campaigns where campaigns.id = campaign_analytics.campaign_id and campaigns.user_id = auth.user_id()));

GRANT USAGE ON SCHEMA auth TO authenticated, anonymous;
