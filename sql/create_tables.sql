-- Create users profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  website TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriber lists table
CREATE TABLE IF NOT EXISTS public.subscriber_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  total_subscribers INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  list_id UUID REFERENCES public.subscriber_lists(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  engagement_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  list_id UUID REFERENCES public.subscriber_lists(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_cold_outreach BOOLEAN DEFAULT FALSE,
  automation_enabled BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign analytics table
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click', 'bounce', 'unsubscribe', 'conversion')),
  subscriber_id UUID REFERENCES public.subscribers(id) ON DELETE SET NULL,
  email TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  device_info JSONB DEFAULT '{}'::jsonb,
  location_info JSONB DEFAULT '{}'::jsonb
);

-- Create campaign automation table
CREATE TABLE IF NOT EXISTS public.campaign_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  triggers JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cold outreach sequences table
CREATE TABLE IF NOT EXISTS public.cold_outreach_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emails JSONB NOT NULL DEFAULT '[]'::jsonb,
  calls JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create A/B test table
CREATE TABLE IF NOT EXISTS public.ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  winner_variant_id TEXT,
  winner_metric TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cold_outreach_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policies for subscriber lists
CREATE POLICY "Users can view their own subscriber lists"
  ON public.subscriber_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriber lists"
  ON public.subscriber_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriber lists"
  ON public.subscriber_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriber lists"
  ON public.subscriber_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for subscribers
CREATE POLICY "Users can view subscribers in their lists"
  ON public.subscribers FOR SELECT
  USING (list_id IN (SELECT id FROM public.subscriber_lists WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert subscribers to their lists"
  ON public.subscribers FOR INSERT
  WITH CHECK (list_id IN (SELECT id FROM public.subscriber_lists WHERE user_id = auth.uid()));

CREATE POLICY "Users can update subscribers in their lists"
  ON public.subscribers FOR UPDATE
  USING (list_id IN (SELECT id FROM public.subscriber_lists WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete subscribers from their lists"
  ON public.subscribers FOR DELETE
  USING (list_id IN (SELECT id FROM public.subscriber_lists WHERE user_id = auth.uid()));

-- Create policies for campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for campaign analytics
CREATE POLICY "Users can view analytics for their campaigns"
  ON public.campaign_analytics FOR SELECT
  USING (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert analytics for their campaigns"
  ON public.campaign_analytics FOR INSERT
  WITH CHECK (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

-- Create policies for campaign automations
CREATE POLICY "Users can view automations for their campaigns"
  ON public.campaign_automations FOR SELECT
  USING (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert automations for their campaigns"
  ON public.campaign_automations FOR INSERT
  WITH CHECK (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can update automations for their campaigns"
  ON public.campaign_automations FOR UPDATE
  USING (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete automations for their campaigns"
  ON public.campaign_automations FOR DELETE
  USING (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

-- Create policies for cold outreach sequences
CREATE POLICY "Users can view sequences for their campaigns"
  ON public.cold_outreach_sequences FOR SELECT
  USING (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert sequences for their campaigns"
  ON public.cold_outreach_sequences FOR INSERT
  WITH CHECK (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can update sequences for their campaigns"
  ON public.cold_outreach_sequences FOR UPDATE
  USING (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete sequences for their campaigns"
  ON public.cold_outreach_sequences FOR DELETE
  USING (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

-- Create policies for email templates
CREATE POLICY "Users can view their own email templates"
  ON public.email_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email templates"
  ON public.email_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email templates"
  ON public.email_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email templates"
  ON public.email_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for A/B tests
CREATE POLICY "Users can view A/B tests for their campaigns"
  ON public.ab_tests FOR SELECT
  USING (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert A/B tests for their campaigns"
  ON public.ab_tests FOR INSERT
  WITH CHECK (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can update A/B tests for their campaigns"
  ON public.ab_tests FOR UPDATE
  USING (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete A/B tests for their campaigns"
  ON public.ab_tests FOR DELETE
  USING (campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid()));

-- Create functions for subscriber management
CREATE FUNCTION public.import_subscribers(
  list_id_param UUID,
  subscribers_param JSONB
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS
$$
DECLARE
  v_subscriber JSONB;
  v_email TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
  v_metadata JSONB;
BEGIN
  -- Update the list count after the import
  FOR v_subscriber IN SELECT * FROM jsonb_array_elements(subscribers_param)
  LOOP
    v_email := v_subscriber->>'email';
    v_first_name := v_subscriber->>'first_name';
    v_last_name := v_subscriber->>'last_name';
    v_metadata := COALESCE(v_subscriber->'metadata', '{}'::jsonb);
    
    -- Insert the subscriber if they don't exist
    INSERT INTO public.subscribers (email, first_name, last_name, list_id, metadata)
    VALUES (v_email, v_first_name, v_last_name, list_id_param, v_metadata)
    ON CONFLICT (email) DO UPDATE
    SET 
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      list_id = EXCLUDED.list_id,
      metadata = subscribers.metadata || EXCLUDED.metadata,
      updated_at = NOW();
  END LOOP;
  
  -- Update the list count
  UPDATE public.subscriber_lists
  SET 
    total_subscribers = (SELECT COUNT(*) FROM public.subscribers WHERE list_id = list_id_param),
    updated_at = NOW()
  WHERE id = list_id_param;
  
END;
$$;

-- Create function to handle unsubscribes
DROP FUNCTION IF EXISTS public.handle_unsubscribe(TEXT, UUID);

CREATE FUNCTION public.handle_unsubscribe(
  email_param TEXT,
  campaign_id_param UUID
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS
$$
DECLARE
  v_list_id UUID;
BEGIN
  -- Get the list ID from the campaign
  SELECT list_id INTO v_list_id FROM public.campaigns WHERE id = campaign_id_param;
  
  -- Update the subscriber
  UPDATE public.subscribers
  SET 
    unsubscribed_at = NOW(),
    updated_at = NOW()
  WHERE email = email_param AND list_id = v_list_id;
  
  -- Update the list count
  UPDATE public.subscriber_lists
  SET 
    total_subscribers = (SELECT COUNT(*) FROM public.subscribers WHERE list_id = v_list_id AND unsubscribed_at IS NULL),
    updated_at = NOW()
  WHERE id = v_list_id;
  
END;
$$;

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriber_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_automations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cold_outreach_sequences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ab_tests;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscribers_list_id ON public.subscribers(list_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_list_id ON public.campaigns(list_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON public.campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_event_type ON public.campaign_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_campaign_automations_campaign_id ON public.campaign_automations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_cold_outreach_sequences_campaign_id ON public.cold_outreach_sequences(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON public.email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_campaign_id ON public.ab_tests(campaign_id);