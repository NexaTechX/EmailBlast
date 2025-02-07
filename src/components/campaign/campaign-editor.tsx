import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CampaignEditor() {
  return (
    <Card className="p-4">
      <Tabs defaultValue="visual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
        </TabsList>
        <TabsContent
          value="visual"
          className="min-h-[500px] border rounded-md p-4"
        >
          <div className="text-muted-foreground text-center pt-20">
            Rich text editor will be implemented in the next step
          </div>
        </TabsContent>
        <TabsContent value="html" className="min-h-[500px]">
          <textarea
            className="w-full h-[500px] font-mono text-sm p-4 border rounded-md"
            placeholder="Enter HTML content..."
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
