-- EmailBlast Complete Database Setup Migration
-- This creates all necessary tables, relationships, policies, and functions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Stores user profile information linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_verified BOOLEAN DEFAULT FALSE,
  full_name TEXT,
  company_name TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles: Users can only access their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- SUBSCRIBER LISTS TABLE
-- ============================================================================
-- Organize subscribers into different lists
CREATE TABLE IF NOT EXISTS public.subscriber_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_subscribers INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscriber_lists
ALTER TABLE public.subscriber_lists ENABLE ROW LEVEL SECURITY;

-- Policies for subscriber_lists: Users can only access their own lists
CREATE POLICY "Users can manage their own subscriber lists" ON public.subscriber_lists
  FOR ALL USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriber_lists_user_id ON public.subscriber_lists(user_id);

-- ============================================================================
-- SUBSCRIBERS TABLE
-- ============================================================================
-- Store email subscribers with engagement tracking
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  list_id UUID REFERENCES public.subscriber_lists(id) ON DELETE SET NULL,
  tags TEXT[],
  metadata JSONB,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Policies for subscribers: All authenticated users can manage subscribers
CREATE POLICY "Authenticated users can manage subscribers" ON public.subscribers
  FOR ALL TO authenticated USING (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_list_id ON public.subscribers(list_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed_at ON public.subscribers(subscribed_at);

-- ============================================================================
-- EMAIL TEMPLATES TABLE
-- ============================================================================
-- Store reusable email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policies for email_templates: Users can only access their own templates
CREATE POLICY "Users can manage their own email templates" ON public.email_templates
  FOR ALL USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON public.email_templates(user_id);

-- ============================================================================
-- CAMPAIGNS TABLE
-- ============================================================================
-- Store email campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  list_id UUID REFERENCES public.subscriber_lists(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  is_cold_outreach BOOLEAN DEFAULT FALSE,
  automation_enabled BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed'))
);

-- Enable RLS on campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Policies for campaigns: Users can only access their own campaigns
CREATE POLICY "Users can manage their own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_list_id ON public.campaigns(list_id);

-- ============================================================================
-- CAMPAIGN ANALYTICS TABLE
-- ============================================================================
-- Track campaign events and engagement metrics
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.subscribers(id) ON DELETE SET NULL,
  email TEXT,
  event_type TEXT NOT NULL,
  metadata JSONB,
  device_info JSONB,
  location_info JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('open', 'click', 'bounce', 'unsubscribe', 'conversion'))
);

-- Enable RLS on campaign_analytics
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for campaign_analytics: Users can access analytics for their campaigns
CREATE POLICY "Users can view analytics for their campaigns" ON public.campaign_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_analytics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert analytics" ON public.campaign_analytics
  FOR INSERT WITH CHECK (true);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON public.campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_event_type ON public.campaign_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_occurred_at ON public.campaign_analytics(occurred_at);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_subscriber_id ON public.campaign_analytics(subscriber_id);

-- ============================================================================
-- CAMPAIGN AUTOMATIONS TABLE
-- ============================================================================
-- Store automation workflows for campaigns
CREATE TABLE IF NOT EXISTS public.campaign_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  triggers JSONB DEFAULT '[]'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_automation_status CHECK (status IN ('active', 'paused', 'draft'))
);

-- Enable RLS on campaign_automations
ALTER TABLE public.campaign_automations ENABLE ROW LEVEL SECURITY;

-- Policies for campaign_automations: Users can access automations for their campaigns
CREATE POLICY "Users can manage automations for their campaigns" ON public.campaign_automations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_automations.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaign_automations_campaign_id ON public.campaign_automations(campaign_id);

-- ============================================================================
-- COLD OUTREACH SEQUENCES TABLE
-- ============================================================================
-- Store multi-step cold outreach sequences
CREATE TABLE IF NOT EXISTS public.cold_outreach_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emails JSONB DEFAULT '[]'::jsonb NOT NULL,
  calls JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_sequence_status CHECK (status IN ('active', 'paused', 'completed'))
);

-- Enable RLS on cold_outreach_sequences
ALTER TABLE public.cold_outreach_sequences ENABLE ROW LEVEL SECURITY;

-- Policies for cold_outreach_sequences: Users can access sequences for their campaigns
CREATE POLICY "Users can manage sequences for their campaigns" ON public.cold_outreach_sequences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = cold_outreach_sequences.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cold_outreach_sequences_campaign_id ON public.cold_outreach_sequences(campaign_id);

-- ============================================================================
-- A/B TESTS TABLE
-- ============================================================================
-- Store A/B test configurations for campaigns
CREATE TABLE IF NOT EXISTS public.ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variants JSONB DEFAULT '[]'::jsonb NOT NULL,
  status TEXT NOT NULL,
  winner_variant_id TEXT,
  winner_metric TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_ab_test_status CHECK (status IN ('draft', 'running', 'completed', 'paused'))
);

-- Enable RLS on ab_tests
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;

-- Policies for ab_tests: Users can access tests for their campaigns
CREATE POLICY "Users can manage A/B tests for their campaigns" ON public.ab_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = ab_tests.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ab_tests_campaign_id ON public.ab_tests(campaign_id);

-- ============================================================================
-- LEADS TABLE
-- ============================================================================
-- Store lead information from lead finder tools
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin TEXT,
  website TEXT,
  industry TEXT,
  employees TEXT,
  location TEXT,
  personal_email TEXT,
  direct_phone TEXT,
  mobile TEXT,
  education TEXT,
  previous_companies TEXT[],
  technologies TEXT[],
  founded TEXT,
  revenue TEXT,
  company_size TEXT,
  interests TEXT[],
  confidence_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies for leads: All authenticated users can access leads
CREATE POLICY "Authenticated users can manage leads" ON public.leads
  FOR ALL TO authenticated USING (true);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company ON public.leads(company);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to handle unsubscribe requests
CREATE OR REPLACE FUNCTION public.handle_unsubscribe(
  email_param TEXT,
  campaign_id_param TEXT
)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to import multiple subscribers
CREATE OR REPLACE FUNCTION public.import_subscribers(
  list_id_param TEXT,
  subscribers_param JSONB
)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriber_lists_updated_at
  BEFORE UPDATE ON public.subscriber_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_automations_updated_at
  BEFORE UPDATE ON public.campaign_automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cold_outreach_sequences_updated_at
  BEFORE UPDATE ON public.cold_outreach_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- REALTIME
-- ============================================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriber_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profile information linked to auth.users';
COMMENT ON TABLE public.subscriber_lists IS 'Lists for organizing subscribers into groups';
COMMENT ON TABLE public.subscribers IS 'Email subscribers with engagement tracking';
COMMENT ON TABLE public.email_templates IS 'Reusable email templates';
COMMENT ON TABLE public.campaigns IS 'Email marketing campaigns';
COMMENT ON TABLE public.campaign_analytics IS 'Tracking events and engagement metrics for campaigns';
COMMENT ON TABLE public.campaign_automations IS 'Automation workflows triggered by campaign events';
COMMENT ON TABLE public.cold_outreach_sequences IS 'Multi-step sequences for cold outreach';
COMMENT ON TABLE public.ab_tests IS 'A/B test configurations for campaigns';
COMMENT ON TABLE public.leads IS 'Lead information from lead finder tools';

