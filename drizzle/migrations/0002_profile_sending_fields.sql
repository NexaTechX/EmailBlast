-- Profile sending identity + CAN-SPAM mailing address
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mailing_address text,
  ADD COLUMN IF NOT EXISTS default_sender_name text,
  ADD COLUMN IF NOT EXISTS default_sender_email text,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
