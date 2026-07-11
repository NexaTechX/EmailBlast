import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Mail, MapPin } from "lucide-react";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const FROM_DOMAIN = import.meta.env.VITE_RESEND_FROM_DOMAIN as
  | string
  | undefined;

export function SendingSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    mailing_address: "",
    default_sender_name: "",
    default_sender_email: "",
  });

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("mailing_address, default_sender_name, default_sender_email")
        .eq("id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setProfile({
          mailing_address: data.mailing_address || "",
          default_sender_name: data.default_sender_name || "",
          default_sender_email:
            data.default_sender_email || user?.email || "",
        });
      }
    } catch (error) {
      console.error("Error loading sending settings:", error);
    }
  };

  useEffect(() => {
    if (user?.id) loadProfile();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.mailing_address.trim()) {
      toast({
        variant: "destructive",
        title: "Mailing address required",
        description:
          "A physical postal address is required for CAN-SPAM compliance.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user?.id, ...profile });

      if (error) throw error;
      toast({
        title: "Sending settings saved",
        description: "Your sender identity and mailing address were updated.",
      });
    } catch (error) {
      console.error("Error saving sending settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Sending setup</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure how your brand appears on campaigns and your CAN-SPAM
          mailing address. EmailBlast handles delivery on our verified domain —
          you do not need a Resend account or DNS setup.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-5">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-2 text-sm">
            <p className="font-medium">How sending works</p>
            <ul className="list-disc pl-4 text-muted-foreground space-y-1">
              <li>
                Campaigns are sent from EmailBlast’s verified domain
                {FROM_DOMAIN ? ` (@${FROM_DOMAIN})` : ""}.
              </li>
              <li>
                Your sender name is shown as the From display name recipients
                see.
              </li>
              <li>
                Your reply-to email is where subscriber replies are delivered.
              </li>
              <li>
                Your physical mailing address is required and injected into
                every email footer.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border">
        <div className="space-y-5 p-6">
          <Field
            label="Default sender name"
            hint="Shown as the From display name on your campaigns."
          >
            <Input
              value={profile.default_sender_name}
              onChange={(e) =>
                setProfile({ ...profile, default_sender_name: e.target.value })
              }
              placeholder="Your Company"
              className="h-11"
            />
          </Field>

          <Field
            label="Reply-to email"
            hint="Where replies from subscribers should go. This is not the From address used for delivery."
          >
            <Input
              type="email"
              value={profile.default_sender_email}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  default_sender_email: e.target.value,
                })
              }
              placeholder="hello@yourdomain.com"
              className="h-11"
            />
          </Field>

          <Field
            label="Physical mailing address"
            hint="Required by CAN-SPAM. Included in every email footer."
          >
            <Textarea
              value={profile.mailing_address}
              onChange={(e) =>
                setProfile({ ...profile, mailing_address: e.target.value })
              }
              placeholder={"123 Main St\nCity, ST 12345\nUnited States"}
              className="min-h-[100px]"
            />
          </Field>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Required before sending campaigns
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save sending settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
