-- Optimization Migration: Fix Security and Performance Issues
-- This addresses security warnings for functions and optimizes RLS policies

-- ============================================================================
-- FIX SECURITY: Add search_path to functions
-- ============================================================================

-- Fix handle_unsubscribe function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_unsubscribe(
  email_param TEXT,
  campaign_id_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the subscriber's unsubscribed_at timestamp
  UPDATE public.subscribers
  SET unsubscribed_at = NOW()
  WHERE email = email_param
  AND unsubscribed_at IS NULL;

  -- Log the unsubscribe event in analytics
  INSERT INTO public.campaign_analytics (
    campaign_id,
    email,
    event_type,
    occurred_at
  )
  VALUES (
    campaign_id_param::UUID,
    email_param,
    'unsubscribe',
    NOW()
  );
END;
$$;

-- Fix import_subscribers function with secure search_path
CREATE OR REPLACE FUNCTION public.import_subscribers(
  list_id_param TEXT,
  subscribers_param JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscriber_record JSONB;
BEGIN
  -- Loop through each subscriber in the JSON array
  FOR subscriber_record IN SELECT * FROM jsonb_array_elements(subscribers_param)
  LOOP
    -- Insert or update subscriber
    INSERT INTO public.subscribers (
      email,
      first_name,
      last_name,
      list_id,
      tags,
      metadata
    )
    VALUES (
      subscriber_record->>'email',
      subscriber_record->>'first_name',
      subscriber_record->>'last_name',
      list_id_param::UUID,
      COALESCE((subscriber_record->'tags')::TEXT[]::TEXT[], ARRAY[]::TEXT[]),
      COALESCE(subscriber_record->'metadata', '{}'::jsonb)
    )
    ON CONFLICT (email) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      list_id = EXCLUDED.list_id,
      tags = EXCLUDED.tags,
      metadata = EXCLUDED.metadata,
      updated_at = NOW();
  END LOOP;

  -- Update the subscriber count for the list
  UPDATE public.subscriber_lists
  SET total_subscribers = (
    SELECT COUNT(*) FROM public.subscribers
    WHERE list_id = list_id_param::UUID
    AND unsubscribed_at IS NULL
  ),
  updated_at = NOW()
  WHERE id = list_id_param::UUID;
END;
$$;

-- Fix update_updated_at_column function with secure search_path
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

-- ============================================================================
-- OPTIMIZE PERFORMANCE: Update RLS policies to use SELECT wrapper
-- ============================================================================

-- Optimize profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- Optimize subscriber_lists policies
DROP POLICY IF EXISTS "Users can manage their own subscriber lists" ON public.subscriber_lists;
CREATE POLICY "Users can manage their own subscriber lists" ON public.subscriber_lists
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- Optimize email_templates policies
DROP POLICY IF EXISTS "Users can manage their own email templates" ON public.email_templates;
CREATE POLICY "Users can manage their own email templates" ON public.email_templates
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- Optimize campaigns policies
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON public.campaigns;
CREATE POLICY "Users can manage their own campaigns" ON public.campaigns
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- Optimize campaign_analytics policies
DROP POLICY IF EXISTS "Users can view analytics for their campaigns" ON public.campaign_analytics;
CREATE POLICY "Users can view analytics for their campaigns" ON public.campaign_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

-- Optimize campaign_automations policies
DROP POLICY IF EXISTS "Users can manage automations for their campaigns" ON public.campaign_automations;
CREATE POLICY "Users can manage automations for their campaigns" ON public.campaign_automations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_automations.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

-- Optimize cold_outreach_sequences policies
DROP POLICY IF EXISTS "Users can manage sequences for their campaigns" ON public.cold_outreach_sequences;
CREATE POLICY "Users can manage sequences for their campaigns" ON public.cold_outreach_sequences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = cold_outreach_sequences.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

-- Optimize ab_tests policies
DROP POLICY IF EXISTS "Users can manage A/B tests for their campaigns" ON public.ab_tests;
CREATE POLICY "Users can manage A/B tests for their campaigns" ON public.ab_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = ab_tests.campaign_id
      AND campaigns.user_id = (SELECT auth.uid())
    )
  );

