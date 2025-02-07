import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CampaignPreview() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline">Send Test Email</Button>
        <Button>Schedule Campaign</Button>
      </div>

      <Card className="p-4">
        <Tabs defaultValue="desktop" className="space-y-4">
          <TabsList>
            <TabsTrigger value="desktop">Desktop</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
          </TabsList>
          <TabsContent
            value="desktop"
            className="min-h-[600px] border rounded-md p-4"
          >
            <div className="text-muted-foreground text-center pt-20">
              Desktop preview will display here
            </div>
          </TabsContent>
          <TabsContent value="mobile" className="min-h-[600px]">
            <div className="max-w-[375px] mx-auto border rounded-md p-4 min-h-[600px]">
              <div className="text-muted-foreground text-center pt-20">
                Mobile preview will display here
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
