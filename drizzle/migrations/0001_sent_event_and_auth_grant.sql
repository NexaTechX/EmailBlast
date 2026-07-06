-- Allow 'sent' event type in campaign_analytics
ALTER TABLE "campaign_analytics" DROP CONSTRAINT IF EXISTS "campaign_analytics_event_type_check";
ALTER TABLE "campaign_analytics" ADD CONSTRAINT "campaign_analytics_event_type_check"
  CHECK ("event_type" in ('open','click','bounce','unsubscribe','conversion','sent'));

-- Grant auth schema access for Neon Data API RLS defaults
GRANT USAGE ON SCHEMA auth TO authenticated, anonymous;
