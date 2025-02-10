import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Users, BarChart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DashboardOverview() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-background border border-border">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <h3 className="font-semibold">Campaigns</h3>
          </div>
          <p className="mt-4 text-4xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">Active campaigns</p>
          <Button
            variant="link"
            className="mt-4 p-0 text-primary hover:text-primary/80"
            onClick={() => navigate("/app/campaigns")}
          >
            View campaigns <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        <Card className="p-6 bg-background border border-border">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="font-semibold">Subscribers</h3>
          </div>
          <p className="mt-4 text-4xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">Total subscribers</p>
          <Button
            variant="link"
            className="mt-4 p-0 text-primary hover:text-primary/80"
            onClick={() => navigate("/app/subscribers")}
          >
            Manage subscribers <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        <Card className="p-6 bg-background border border-border">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            <h3 className="font-semibold">Analytics</h3>
          </div>
          <p className="mt-4 text-4xl font-bold">0%</p>
          <p className="text-sm text-muted-foreground">Average open rate</p>
          <Button
            variant="link"
            className="mt-4 p-0 text-primary hover:text-primary/80"
            onClick={() => navigate("/app/analytics")}
          >
            View analytics <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-background border border-border">
          <h3 className="font-semibold mb-4">Recent Campaigns</h3>
          <div className="text-center py-8 text-muted-foreground">
            No campaigns yet
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/app/campaigns/new")}
          >
            Create your first campaign
          </Button>
        </Card>

        <Card className="p-6 bg-background border border-border">
          <h3 className="font-semibold mb-4">Subscriber Growth</h3>
          <div className="text-center py-8 text-muted-foreground">
            No data available yet
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/app/subscribers")}
          >
            Add subscribers
          </Button>
        </Card>
      </div>
    </div>
  );
}
