import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CampaignDetails() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="subject">Subject Line</Label>
          <Input id="subject" placeholder="Enter your email subject line" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sender">Sender Name</Label>
          <Input id="sender" placeholder="Enter sender name" />
        </div>
      </div>

      <Card className="p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Subscriber List</h3>
          <p className="text-sm text-muted-foreground">Total Subscribers: 0</p>
          <Button variant="outline">Select List</Button>
        </div>
      </Card>
    </div>
  );
}
