-- Create leads table for storing lead information
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

-- Enable row level security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
DROP POLICY IF EXISTS "Allow all operations for authenticated users on leads";
CREATE POLICY "Allow all operations for authenticated users on leads" ON public.leads
  FOR ALL
  TO authenticated
  USING (true);

-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
