import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, XCircle, Home } from "lucide-react";

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    handleUnsubscribe();
  }, []);

  const handleUnsubscribe = async () => {
    const emailParam = searchParams.get("email");
    const campaignId = searchParams.get("campaign");

    if (!emailParam) {
      setStatus("error");
      return;
    }

    setEmail(emailParam);

    try {
      // Unsubscribe is an unauthenticated action, so it runs server-side
      // (/api/unsubscribe) which updates the subscriber + logs analytics with
      // elevated DB access. Idempotent: already-unsubscribed still returns 200.
      const params = new URLSearchParams({ email: emailParam });
      if (campaignId) params.set("campaign", campaignId);

      const res = await fetch(`/api/unsubscribe?${params.toString()}`);
      if (!res.ok) throw new Error(`Unsubscribe failed (${res.status})`);

      setStatus("success");
    } catch (error) {
      console.error("Error unsubscribing:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">EmailBlast</h1>
        </div>

        <Card className="p-8">
          {status === "loading" && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Processing your request...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Successfully Unsubscribed</h2>
              <p className="text-muted-foreground mb-6">
                {email ? (
                  <>
                    <span className="font-medium">{email}</span> has been removed from our mailing list.
                  </>
                ) : (
                  "You have been removed from our mailing list."
                )}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                We&apos;re sorry to see you go! You will no longer receive
                emails from us.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Changed your mind?
                </p>
                <Button variant="outline" onClick={() => navigate("/")}>
                  <Home className="mr-2 h-4 w-4" />
                  Return to Homepage
                </Button>
              </div>
            </div>
          )}

          {status === "already" && (
            <div className="text-center py-8">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Already Unsubscribed</h2>
              <p className="text-muted-foreground mb-6">
                {email ? (
                  <>
                    <span className="font-medium">{email}</span> is already unsubscribed from our mailing list.
                  </>
                ) : (
                  "This email address is already unsubscribed."
                )}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You will not receive any further emails from us.
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>
                <Home className="mr-2 h-4 w-4" />
                Return to Homepage
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-8">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error</h2>
              <p className="text-muted-foreground mb-6">
                We encountered an error processing your unsubscribe request. This could be because:
              </p>
              <ul className="text-sm text-muted-foreground text-left mb-6 space-y-2 max-w-md mx-auto">
                <li>• The unsubscribe link is invalid or expired</li>
                <li>• The email address was not found in our system</li>
                <li>• There was a technical error</li>
              </ul>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Please contact us directly if you continue to receive unwanted emails:
                </p>
                <p className="text-sm font-medium">support@emailblast.com</p>
                <Button variant="outline" onClick={() => navigate("/")}>
                  <Home className="mr-2 h-4 w-4" />
                  Return to Homepage
                </Button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground">
              This is an automated unsubscribe system. If you have questions,{" "}
              <a href="mailto:support@emailblast.com" className="text-primary hover:underline">
                contact our support team
              </a>.
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>
            {" • "}
            <a href="/legal/terms" className="text-primary hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}

