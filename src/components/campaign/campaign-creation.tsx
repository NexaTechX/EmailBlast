import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignDetails } from "./campaign-details";
import { CampaignEditor } from "./campaign-editor";
import { CampaignPreview } from "./campaign-preview";

export default function CampaignCreation() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tight">Create Campaign</h1>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Campaign Details</TabsTrigger>
            <TabsTrigger value="content">Email Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <CampaignDetails />
          </TabsContent>
          <TabsContent value="content" className="space-y-4">
            <CampaignEditor />
          </TabsContent>
          <TabsContent value="preview" className="space-y-4">
            <CampaignPreview />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
