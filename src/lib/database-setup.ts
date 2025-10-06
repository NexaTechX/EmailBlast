import { supabase } from "./supabase";

export async function setupDatabase() {
  try {
    // Check if tables exist
    const { error: profilesError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    const { error: subscribersError } = await supabase
      .from("subscribers")
      .select("count")
      .limit(1);

    const { error: campaignsError } = await supabase
      .from("campaigns")
      .select("count")
      .limit(1);

    const { error: analyticsError } = await supabase
      .from("campaign_analytics")
      .select("count")
      .limit(1);

    // If any table doesn't exist, create all tables
    if (
      (profilesError && profilesError.code === "42P01") ||
      (subscribersError && subscribersError.code === "42P01") ||
      (campaignsError && campaignsError.code === "42P01") ||
      (analyticsError && analyticsError.code === "42P01")
    ) {
      console.log("Creating database tables...");

      // Create tables using the SQL from create_tables.sql
      try {
        await supabase.rpc("exec_sql", {
          sql_string: `
          -- Create profiles table
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email_verified BOOLEAN DEFAULT FALSE,
            full_name TEXT,
            company_name TEXT,
            website TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create subscribers table
          CREATE TABLE IF NOT EXISTS public.subscribers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email TEXT UNIQUE NOT NULL,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            company TEXT,
            job_title TEXT,
            tags TEXT[],
            metadata JSONB,
            subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            unsubscribed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create campaigns table
          CREATE TABLE IF NOT EXISTS public.campaigns (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            subject TEXT NOT NULL,
            sender_name TEXT,
            sender_email TEXT,
            content TEXT,
            status TEXT DEFAULT 'draft',
            list_id TEXT,
            scheduled_at TIMESTAMP WITH TIME ZONE,
            sent_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create campaign_analytics table
          CREATE TABLE IF NOT EXISTS public.campaign_analytics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
            subscriber_id TEXT,
            event_type TEXT NOT NULL,
            occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            metadata JSONB
          );
          
          -- Enable RLS but allow all operations for development
          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Allow all operations for authenticated users on profiles" ON public.profiles
            FOR ALL
            TO authenticated
            USING (true);
          
          CREATE POLICY "Allow all operations for authenticated users on subscribers" ON public.subscribers
            FOR ALL
            TO authenticated
            USING (true);
          
          CREATE POLICY "Allow all operations for authenticated users on campaigns" ON public.campaigns
            FOR ALL
            TO authenticated
            USING (true);
          
          CREATE POLICY "Allow all operations for authenticated users on campaign_analytics" ON public.campaign_analytics
            FOR ALL
            TO authenticated
            USING (true);
          
          -- Enable realtime
          ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
          ALTER PUBLICATION supabase_realtime ADD TABLE public.subscribers;
          ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
          ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_analytics;
        `,
        });
        console.log("Database tables created successfully");
      } catch (err) {
        console.error("Error creating tables:", err);
        // Try creating tables one by one if the batch operation fails
        await createTablesIndividually();
      }
      
      return true;
    }

    console.log("Database tables already exist");
    return true;
  } catch (error) {
    console.error("Error setting up database:", error);
    return false;
  }
}

async function createTablesIndividually() {
  try {
    // Create profiles table
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email_verified BOOLEAN DEFAULT FALSE,
          full_name TEXT,
          company_name TEXT,
          website TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users on profiles" ON public.profiles
          FOR ALL
          TO authenticated
          USING (true);
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
      `,
    });

    // Create subscribers table
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.subscribers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          first_name TEXT,
          last_name TEXT,
          phone TEXT,
          company TEXT,
          job_title TEXT,
          tags TEXT[],
          metadata JSONB,
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          unsubscribed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users on subscribers" ON public.subscribers
          FOR ALL
          TO authenticated
          USING (true);
        ALTER PUBLICATION supabase_realtime ADD TABLE public.subscribers;
      `,
    });

    // Create campaigns table
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.campaigns (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          subject TEXT NOT NULL,
          sender_name TEXT,
          sender_email TEXT,
          content TEXT,
          status TEXT DEFAULT 'draft',
          list_id TEXT,
          scheduled_at TIMESTAMP WITH TIME ZONE,
          sent_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users on campaigns" ON public.campaigns
          FOR ALL
          TO authenticated
          USING (true);
        ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
      `,
    });

    // Create campaign_analytics table
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.campaign_analytics (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
          subscriber_id TEXT,
          event_type TEXT NOT NULL,
          occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB
        );
        ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations for authenticated users on campaign_analytics" ON public.campaign_analytics
          FOR ALL
          TO authenticated
          USING (true);
        ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_analytics;
      `,
    });

    console.log("Database tables created individually");
    return true;
  } catch (error) {
    console.error("Error creating tables individually:", error);
    return false;
  }
}
