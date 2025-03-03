import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, Users, ArrowRight, Plus, Trash } from "lucide-react";

export function CampaignAutomation() {
  const [triggerCount, setTriggerCount] = useState(1);
  const [actionCount, setActionCount] = useState(1);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">Campaign Automation</h3>

      <Tabs defaultValue="workflow">
        <TabsList className="mb-6">
          <TabsTrigger value="workflow">Workflow Builder</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Triggers</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTriggerCount((prev) => prev + 1)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Trigger
              </Button>
            </div>

            {Array.from({ length: triggerCount }).map((_, index) => (
              <div key={index} className="p-4 border rounded-md space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Trigger #{index + 1}</h5>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTriggerCount((prev) => prev - 1)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`trigger-type-${index}`}>Trigger Type</Label>
                  <Select defaultValue="open">
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Email Opened</SelectItem>
                      <SelectItem value="click">Link Clicked</SelectItem>
                      <SelectItem value="no-open">
                        Not Opened After Time
                      </SelectItem>
                      <SelectItem value="form">Form Submitted</SelectItem>
                      <SelectItem value="custom">Custom Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`trigger-condition-${index}`}>
                    Condition
                  </Label>
                  <Select defaultValue="any">
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Email</SelectItem>
                      <SelectItem value="specific">Specific Email</SelectItem>
                      <SelectItem value="multiple">Multiple Times</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            <div className="flex justify-center my-4">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Actions</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionCount((prev) => prev + 1)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </div>

            {Array.from({ length: actionCount }).map((_, index) => (
              <div key={index} className="p-4 border rounded-md space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Action #{index + 1}</h5>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActionCount((prev) => prev - 1)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`action-type-${index}`}>Action Type</Label>
                  <Select defaultValue="send">
                    <SelectTrigger>
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send">Send Email</SelectItem>
                      <SelectItem value="wait">Wait</SelectItem>
                      <SelectItem value="tag">Add Tag</SelectItem>
                      <SelectItem value="list">Add to List</SelectItem>
                      <SelectItem value="notify">Send Notification</SelectItem>
                      <SelectItem value="webhook">Trigger Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`action-details-${index}`}>
                    Email Template
                  </Label>
                  <Select defaultValue="template1">
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="template1">
                        Follow-up Template
                      </SelectItem>
                      <SelectItem value="template2">
                        Promotional Offer
                      </SelectItem>
                      <SelectItem value="template3">
                        Webinar Invitation
                      </SelectItem>
                      <SelectItem value="custom">Custom Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`action-delay-${index}`}>Delay</Label>
                  <Select defaultValue="1day">
                    <SelectTrigger>
                      <SelectValue placeholder="Select delay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediately</SelectItem>
                      <SelectItem value="1hour">1 Hour</SelectItem>
                      <SelectItem value="1day">1 Day</SelectItem>
                      <SelectItem value="3days">3 Days</SelectItem>
                      <SelectItem value="1week">1 Week</SelectItem>
                      <SelectItem value="custom">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-type">Schedule Type</Label>
              <Select defaultValue="one-time">
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time Send</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="triggered">Event Triggered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-date">Send Date</Label>
              <Input id="send-date" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-time">Send Time</Label>
              <Input id="send-time" type="time" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch />
                Use AI to optimize send time
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI will analyze past engagement data to determine the
                optimal send time for each recipient.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="segmentation" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="segment-type">Segment Type</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select segment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscribers</SelectItem>
                  <SelectItem value="list">Specific List</SelectItem>
                  <SelectItem value="tag">Tag Based</SelectItem>
                  <SelectItem value="behavior">Behavior Based</SelectItem>
                  <SelectItem value="custom">Custom Segment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="list-selection">Select List</Label>
              <Select defaultValue="list1">
                <SelectTrigger>
                  <SelectValue placeholder="Select list" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list1">Main Newsletter (2,500)</SelectItem>
                  <SelectItem value="list2">New Subscribers (500)</SelectItem>
                  <SelectItem value="list3">VIP Customers (1,000)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch />
                Use AI for predictive segmentation
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI will analyze past behavior to identify subscribers most
                likely to engage with this campaign.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button>Save Automation</Button>
      </div>
    </Card>
  );
}
