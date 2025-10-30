import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Mail, Users, BarChart, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

interface WelcomeStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
  actionLabel?: string;
}

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen onboarding
    if (user) {
      const hasSeenOnboarding = localStorage.getItem("emailblast_onboarding_complete");
      if (!hasSeenOnboarding) {
        // Small delay before showing modal
        setTimeout(() => setOpen(true), 500);
      }
    }
  }, [user]);

  const steps: WelcomeStep[] = [
    {
      id: "welcome",
      title: "Welcome to EmailBlast! 🎉",
      description: "We're excited to help you grow your business with powerful email marketing. Let's get you started with a quick tour.",
      icon: <Rocket className="h-12 w-12 text-primary" />,
    },
    {
      id: "subscribers",
      title: "Import Your Subscribers",
      description: "Start by adding your contacts. You can import from CSV, add them manually, or use our Lead Finder tool to discover new prospects.",
      icon: <Users className="h-12 w-12 text-primary" />,
      action: () => {
        setOpen(false);
        navigate("/app/subscribers");
      },
      actionLabel: "Import Subscribers",
    },
    {
      id: "campaign",
      title: "Create Your First Campaign",
      description: "Design beautiful emails with our intuitive editor. Use AI assistance, choose from templates, or start from scratch.",
      icon: <Mail className="h-12 w-12 text-primary" />,
      action: () => {
        setOpen(false);
        navigate("/app/campaigns/new");
      },
      actionLabel: "Create Campaign",
    },
    {
      id: "analytics",
      title: "Track Your Success",
      description: "Monitor opens, clicks, and conversions in real-time. Use insights to optimize your campaigns and grow your audience.",
      icon: <BarChart className="h-12 w-12 text-primary" />,
      action: () => {
        setOpen(false);
        navigate("/app/analytics");
      },
      actionLabel: "View Analytics",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("emailblast_onboarding_complete", "true");
    setOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem("emailblast_onboarding_complete", "true");
    setOpen(false);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            {currentStepData.icon}
          </div>
          <DialogTitle className="text-2xl text-center">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {currentStep === 0 && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Quick Start Checklist:</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>Import your subscriber list</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>Create and send your first campaign</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <BarChart className="h-4 w-4 text-primary" />
                <span>Monitor performance and optimize</span>
              </li>
            </ul>
          </div>
        )}

        <DialogFooter className="flex justify-between items-center">
          <div className="flex-1">
            {currentStep > 0 && (
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tour
            </Button>
            
            {currentStepData.action && currentStepData.actionLabel ? (
              <Button onClick={currentStepData.action}>
                {currentStepData.actionLabel}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Get Started
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

