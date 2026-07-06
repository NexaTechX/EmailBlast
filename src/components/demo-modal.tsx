import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Try EmailBlast free</DialogTitle>
          <DialogDescription>
            We&apos;re in beta — the best way to see the product is to create an
            account and send a test campaign to yourself.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm text-muted-foreground">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Sign up and add your mailing address in Settings → Sending</li>
            <li>Import subscribers to a list</li>
            <li>Create a campaign and send a test email</li>
          </ol>
          <Button
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              navigate("/auth");
            }}
          >
            Join free beta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
