import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  Database,
  RefreshCw,
  Check,
  AlertTriangle,
  Phone,
  Copy,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function CRMIntegration() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedCRM, setSelectedCRM] = useState("salesforce");

  const handleConnect = () => {
    setConnecting(true);
    // Simulate connection
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnected(false);
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">CRM & Third-Party Integrations</h3>

      <Tabs defaultValue="crm">
        <TabsList className="mb-6">
          <TabsTrigger value="crm">CRM Systems</TabsTrigger>
          <TabsTrigger value="marketing">Marketing Tools</TabsTrigger>
          <TabsTrigger value="voice">Voice & Call Systems</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks & API</TabsTrigger>
        </TabsList>

        <TabsContent value="crm" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold">CRM Connection</h4>
                <p className="text-sm text-muted-foreground">
                  Connect your CRM to sync contacts and track campaign
                  performance
                </p>
              </div>
              <Badge variant={connected ? "success" : "outline"}>
                {connected ? "Connected" : "Not Connected"}
              </Badge>
            </div>

            <div className="space-y-4 p-4 border rounded-md">
              <div className="space-y-2">
                <Label htmlFor="crm-select">Select CRM Platform</Label>
                <Select
                  value={selectedCRM}
                  onValueChange={setSelectedCRM}
                  disabled={connected}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CRM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salesforce">Salesforce</SelectItem>
                    <SelectItem value="hubspot">HubSpot</SelectItem>
                    <SelectItem value="zoho">Zoho CRM</SelectItem>
                    <SelectItem value="pipedrive">Pipedrive</SelectItem>
                    <SelectItem value="custom">Custom CRM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!connected ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter your CRM API key"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instance-url">Instance URL</Label>
                    <Input
                      id="instance-url"
                      placeholder="https://your-instance.salesforce.com"
                    />
                  </div>

                  <Button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full"
                  >
                    {connecting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4 mr-2" />
                    )}
                    {connecting ? "Connecting..." : "Connect CRM"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Contact Sync</span>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Campaign Tracking</span>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Lead Scoring</span>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span>Opportunity Sync</span>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    className="w-full mt-4"
                  >
                    Disconnect CRM
                  </Button>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              Marketing Platform Integrations
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">GA</span>
                  </div>
                  <div>
                    <h5 className="font-medium">Google Analytics</h5>
                    <p className="text-xs text-muted-foreground">
                      Track campaign performance
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>

              <div className="p-4 border rounded-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">FB</span>
                  </div>
                  <div>
                    <h5 className="font-medium">Facebook Ads</h5>
                    <p className="text-xs text-muted-foreground">
                      Sync audiences and conversions
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>

              <div className="p-4 border rounded-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">YT</span>
                  </div>
                  <div>
                    <h5 className="font-medium">YouTube</h5>
                    <p className="text-xs text-muted-foreground">
                      Video campaign integration
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>

              <div className="p-4 border rounded-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">MA</span>
                  </div>
                  <div>
                    <h5 className="font-medium">Marketo</h5>
                    <p className="text-xs text-muted-foreground">
                      Marketing automation
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              Voice & Call System Integrations
            </h4>

            <div className="p-4 border rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Twilio Integration</h5>
                  <p className="text-sm text-muted-foreground">
                    Connect Twilio for voice and SMS capabilities
                  </p>
                </div>
                <Badge variant="outline">Not Connected</Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twilio-sid">Twilio Account SID</Label>
                <Input
                  id="twilio-sid"
                  placeholder="Enter your Twilio Account SID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twilio-token">Twilio Auth Token</Label>
                <Input
                  id="twilio-token"
                  type="password"
                  placeholder="Enter your Twilio Auth Token"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twilio-phone">Twilio Phone Number</Label>
                <Input id="twilio-phone" placeholder="+1234567890" />
              </div>

              <Button className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Connect Twilio
              </Button>
            </div>

            <div className="p-4 border rounded-md">
              <h5 className="font-medium mb-2">Other Voice Integrations</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  RingCentral
                </Button>
                <Button variant="outline" size="sm">
                  Aircall
                </Button>
                <Button variant="outline" size="sm">
                  Dialpad
                </Button>
                <Button variant="outline" size="sm">
                  Custom VoIP
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              Webhooks & API Configuration
            </h4>

            <div className="p-4 border rounded-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    value="https://api.yourdomain.com/email-events"
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this URL to receive real-time email event notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key-gen">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key-gen"
                    value="sk_live_51NzT..."
                    type="password"
                    className="flex-1"
                  />
                  <Button variant="outline">Regenerate</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook Events</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="event-open" defaultChecked />
                    <Label htmlFor="event-open">Email Opens</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="event-click" defaultChecked />
                    <Label htmlFor="event-click">Link Clicks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="event-bounce" defaultChecked />
                    <Label htmlFor="event-bounce">Bounces</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="event-unsub" defaultChecked />
                    <Label htmlFor="event-unsub">Unsubscribes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="event-spam" defaultChecked />
                    <Label htmlFor="event-spam">Spam Reports</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="event-delivery" defaultChecked />
                    <Label htmlFor="event-delivery">Deliveries</Label>
                  </div>
                </div>
              </div>

              <Button>
                <Database className="h-4 w-4 mr-2" />
                Save Webhook Configuration
              </Button>
            </div>

            <div className="p-4 border rounded-md">
              <h5 className="font-medium mb-2">API Documentation</h5>
              <p className="text-sm text-muted-foreground mb-4">
                Access our comprehensive API documentation to integrate with
                your systems.
              </p>
              <Button variant="outline">
                <Link2 className="h-4 w-4 mr-2" />
                View API Docs
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
