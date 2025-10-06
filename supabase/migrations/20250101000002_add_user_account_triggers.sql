-- User Account Management: Auto-create profiles and handle user lifecycle
-- This ensures profiles are created when users sign up through Supabase Auth

-- ============================================================================
-- EXTEND PROFILES TABLE with additional user account fields
-- ============================================================================

-- Add useful account-related fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Add constraint for subscription tier
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_subscription_tier;
ALTER TABLE public.profiles ADD CONSTRAINT valid_subscription_tier 
  CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise'));

-- Add constraint for subscription status
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_subscription_status;
ALTER TABLE public.profiles ADD CONSTRAINT valid_subscription_status 
  CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing', 'paused'));

-- ============================================================================
-- AUTO-CREATE PROFILE TRIGGER
-- ============================================================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email_verified,
    subscription_tier,
    subscription_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
    'free',
    'active',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- UPDATE PROFILE EMAIL VERIFICATION TRIGGER
-- ============================================================================

-- Function to sync email verification status from auth.users to profiles
CREATE OR REPLACE FUNCTION public.handle_user_email_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update if email was just verified
  IF (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL) THEN
    UPDATE public.profiles
    SET email_verified = TRUE,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to sync email verification
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_verified();

-- ============================================================================
-- USER DELETION CASCADE TRIGGER (Safety)
-- ============================================================================

-- The foreign key already handles cascade deletion, but we can add logging
COMMENT ON CONSTRAINT profiles_id_fkey ON public.profiles IS 
  'Auto-deletes profile when auth.users record is deleted (CASCADE)';

-- ============================================================================
-- HELPER FUNCTIONS FOR USER MANAGEMENT
-- ============================================================================

-- Function to update user last login timestamp
CREATE OR REPLACE FUNCTION public.update_user_last_login(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_login_at = NOW(),
      updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Function to check if user's email is verified
CREATE OR REPLACE FUNCTION public.is_email_verified(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_verified BOOLEAN;
BEGIN
  SELECT email_verified INTO is_verified
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN COALESCE(is_verified, FALSE);
END;
$$;

-- Function to get user's subscription status
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_id UUID)
RETURNS TABLE (
  tier TEXT,
  status TEXT,
  trial_ends_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    subscription_tier,
    subscription_status,
    profiles.trial_ends_at
  FROM public.profiles
  WHERE id = user_id;
END;
$$;

-- ============================================================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

-- Index for subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier 
  ON public.profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
  ON public.profiles(subscription_status);

-- Index for trial expiry queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at 
  ON public.profiles(trial_ends_at) 
  WHERE trial_ends_at IS NOT NULL;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user''s profile avatar image';
COMMENT ON COLUMN public.profiles.subscription_tier IS 'User subscription plan: free, starter, professional, enterprise';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current subscription status: active, cancelled, past_due, trialing, paused';
COMMENT ON COLUMN public.profiles.trial_ends_at IS 'When the user''s trial period ends';
COMMENT ON COLUMN public.profiles.last_login_at IS 'Timestamp of user''s last login';

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a user signs up';
COMMENT ON FUNCTION public.handle_user_email_verified() IS 'Syncs email verification status from auth.users to profiles';
COMMENT ON FUNCTION public.update_user_last_login(UUID) IS 'Updates the last login timestamp for a user';
COMMENT ON FUNCTION public.is_email_verified(UUID) IS 'Returns whether a user''s email is verified';
COMMENT ON FUNCTION public.get_user_subscription(UUID) IS 'Returns user''s subscription details';

