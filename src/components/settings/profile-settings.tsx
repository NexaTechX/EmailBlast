import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// Labelled form-field wrapper used by the profile form.
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

// Profile settings form: loads and updates the user's profile row.
export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    company_name: "",
    website: "",
  });

  // Loads the user's profile row into state (no-op if the table is absent).
  const loadProfile = async () => {
    try {
      // First check if the profiles table exists
      const { error: tableCheckError } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      // If the table doesn't exist, create a default profile in memory
      if (tableCheckError && tableCheckError.code === "42P01") {
        console.log("Profiles table does not exist yet, using default profile");
        return;
      }

      // If the table exists, try to get the user's profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile. Please try again later.",
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  // Persists the edited profile back to the database.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First check if the profiles table exists
      const { error: tableCheckError } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      // If the table doesn't exist, show a message to run the SQL script
      if (tableCheckError && tableCheckError.code === "42P01") {
        toast({
          variant: "destructive",
          title: "Database Setup Required",
          description:
            "Please run the SQL script to create the profiles table first.",
        });
        return;
      }

      // If the table exists, update the profile
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user?.id, ...profile });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Profile</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal and company details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border">
        <div className="space-y-5 p-6">
          <Field label="Email">
            <Input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="h-11"
            />
          </Field>

          <Field label="Full name">
            <Input
              value={profile.full_name}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
              className="h-11"
            />
          </Field>

          <Field label="Company">
            <Input
              value={profile.company_name}
              onChange={(e) =>
                setProfile({ ...profile, company_name: e.target.value })
              }
              className="h-11"
            />
          </Field>

          <Field label="Website">
            <Input
              type="url"
              placeholder="https://"
              value={profile.website}
              onChange={(e) =>
                setProfile({ ...profile, website: e.target.value })
              }
              className="h-11"
            />
          </Field>
        </div>

        <div className="flex justify-end border-t px-6 py-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
