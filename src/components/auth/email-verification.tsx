import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already verified
    const checkVerification = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("email_verified")
          .eq("id", user.id)
          .single();

        if (!error && data && data.email_verified) {
          setVerified(true);
          // Redirect to dashboard after a short delay
          setTimeout(() => navigate("/app"), 2000);
        }
      }
    };

    checkVerification();
  }, [user, navigate]);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "Please enter a valid 6-digit verification code",
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you would verify the code with your backend
      // For this example, we'll simulate verification with a simple check
      if (verificationCode === "123456") {
        // Replace with actual verification logic
        // Update user profile to mark email as verified
        const { error } = await supabase
          .from("profiles")
          .update({ email_verified: true })
          .eq("id", user?.id);

        if (error) throw error;

        setVerified(true);
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified",
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => navigate("/app"), 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid code",
          description: "The verification code you entered is incorrect",
        });
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "An error occurred while verifying your email",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      // In a real implementation, you would call your backend to resend the code
      // For this example, we'll just simulate a successful resend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email",
      });
    } catch (error) {
      console.error("Error resending code:", error);
      toast({
        variant: "destructive",
        title: "Failed to resend code",
        description: "An error occurred while resending the verification code",
      });
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <Card className="w-[400px] p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold">Email Verified</h2>
          <p className="text-muted-foreground">
            Your email has been successfully verified. Redirecting to
            dashboard...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-[400px] p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-sm text-muted-foreground">
            We've sent a verification code to your email. Please enter it below
            to continue.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={handleResendCode}
              disabled={resending}
            >
              {resending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                "Didn't receive a code? Resend"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
