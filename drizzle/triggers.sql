-- Run AFTER `drizzle-kit push` (e.g. `psql "$DATABASE_URL" -f drizzle/triggers.sql`).
-- Drizzle manages tables/columns/constraints/RLS; this file holds the one piece
-- it can't express from the schema: the BEFORE UPDATE trigger that bumps
-- updated_at. (Data API writes go straight to Postgres, so an app-layer
-- $onUpdate would not fire — the trigger must live in the database.)

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles',
    'subscriber_lists',
    'subscribers',
    'email_templates',
    'campaigns',
    'campaign_automations',
    'cold_outreach_sequences',
    'ab_tests',
    'leads',
    'user_preferences'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I;', t, t);
    EXECUTE format(
      'CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();',
      t, t
    );
  END LOOP;
END;
$$;
