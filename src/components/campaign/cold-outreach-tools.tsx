import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  Clock,
  Plus,
  Trash,
  Save,
  Calendar,
  Users,
  BarChart,
  Settings,
  Sparkles,
} from "lucide-react";

interface FollowUpEmail {
  id: string;
  subject: string;
  content: string;
  delay: string;
  condition: string;
  sendIfNoResponse: boolean;
}

interface CallSettings {
  timing: string;
  delay: string;
  script: string;
  skipIfOpened: boolean;
  logToCrm: boolean;
}

export function ColdOutreachTools() {
  const { toast } = useToast();
  const [initialEmail, setInitialEmail] = useState({
    subject: "",
    content: "",
    sendTime: "immediate",
    aiPersonalization: false,
  });
  const [followUpEmails, setFollowUpEmails] = useState<FollowUpEmail[]>([
    {
      id: "1",
      subject: "",
      content: "",
      delay: "3days",
      condition: "no_response",
      sendIfNoResponse: true,
    },
  ]);
  const [callSettings, setCallSettings] = useState<CallSettings>({
    timing: "email2",
    delay: "1day",
    script: "",
    skipIfOpened: true,
    logToCrm: false,
  });
  const [callScriptVisible, setCallScriptVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [saving, setSaving] = useState(false);

  const handleInitialEmailChange = (field: string, value: string | boolean) => {
    setInitialEmail((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFollowUpChange = (
    id: string,
    field: string,
    value: string | boolean,
  ) => {
    setFollowUpEmails((prev) =>
      prev.map((email) =>
        email.id === id ? { ...email, [field]: value } : email,
      ),
    );
  };

  const handleCallSettingChange = (field: string, value: string | boolean) => {
    setCallSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addFollowUp = () => {
    const newId = (followUpEmails.length + 1).toString();
    setFollowUpEmails((prev) => [
      ...prev,
      {
        id: newId,
        subject: "",
        content: "",
        delay: "3days",
        condition: "no_response",
        sendIfNoResponse: true,
      },
    ]);
  };

  const removeFollowUp = (id: string) => {
    if (followUpEmails.length <= 1) return;
    setFollowUpEmails((prev) => prev.filter((email) => email.id !== id));
  };

  const saveSequence = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to the database
      // For now, we'll just simulate a delay and show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Sequence Saved",
        description: "Your cold outreach sequence has been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save sequence. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateAIContent = () => {
    toast({
      title: "AI Content Generated",
      description: "AI has personalized your email content.",
    });

    // In a real implementation, this would call an AI service
    // For now, we'll just set some example content
    if (activeTab === "email") {
      setInitialEmail((prev) => ({
        ...prev,
        subject: "Opportunity to improve your [Industry] results",
        content:
          "Hi {{first_name}},\n\nI noticed that your company has been making strides in the [Industry] space, and I thought you might be interested in learning how our solution has helped similar businesses achieve 30% better results.\n\nWould you be open to a quick 15-minute call to discuss how we might be able to help?\n\nBest regards,\n[Your Name]",
      }));
    } else if (activeTab === "call") {
      setCallSettings((prev) => ({
        ...prev,
        script:
          "Hello [Name], this is [Your Name] from [Your Company].\n\nI recently sent you an email about how we've been helping companies in [Industry] improve their results by up to 30%.\n\nI'm calling to see if you'd be interested in learning more about our approach and how it might benefit your business.\n\nDo you have a few minutes to chat?",
      }));
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Cold Outreach Tools</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={generateAIContent}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={saveSequence} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Sequence"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Sequence
          </TabsTrigger>
          <TabsTrigger value="call" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Call Integration
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-6">
          <Card className="p-4 border-2 border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold">Initial Email</h4>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  Step 1
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="personalization" className="text-sm">
                  AI Personalization
                </Label>
                <Switch
                  id="personalization"
                  checked={initialEmail.aiPersonalization}
                  onCheckedChange={(checked) =>
                    handleInitialEmailChange("aiPersonalization", checked)
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="Enter subject line"
                  value={initialEmail.subject}
                  onChange={(e) =>
                    handleInitialEmailChange("subject", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your email content"
                  className="min-h-[150px]"
                  value={initialEmail.content}
                  onChange={(e) =>
                    handleInitialEmailChange("content", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delay">Send Time</Label>
                <Select
                  value={initialEmail.sendTime}
                  onValueChange={(value) =>
                    handleInitialEmailChange("sendTime", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select send time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Send Immediately</SelectItem>
                    <SelectItem value="morning">Morning (8-10 AM)</SelectItem>
                    <SelectItem value="afternoon">
                      Afternoon (1-3 PM)
                    </SelectItem>
                    <SelectItem value="optimal">AI Optimal Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold">Follow-up Sequence</h4>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  {followUpEmails.length} Steps
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={addFollowUp}>
                <Plus className="h-4 w-4 mr-2" />
                Add Follow-up
              </Button>
            </div>

            {followUpEmails.map((email, index) => (
              <Card key={email.id} className="space-y-4 mb-6 p-4 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">Follow-up #{index + 1}</h5>
                    <Badge variant="outline">
                      {email.delay === "1day"
                        ? "1 Day After"
                        : email.delay === "3days"
                          ? "3 Days After"
                          : email.delay === "1week"
                            ? "1 Week After"
                            : email.delay === "2weeks"
                              ? "2 Weeks After"
                              : "Custom"}
                    </Badge>
                  </div>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFollowUp(email.id)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`follow-subject-${email.id}`}>
                    Subject Line
                  </Label>
                  <Input
                    id={`follow-subject-${email.id}`}
                    placeholder="Enter subject line"
                    value={email.subject}
                    onChange={(e) =>
                      handleFollowUpChange(email.id, "subject", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`follow-content-${email.id}`}>
                    Email Content
                  </Label>
                  <Textarea
                    id={`follow-content-${email.id}`}
                    placeholder="Enter your follow-up content"
                    className="min-h-[100px]"
                    value={email.content}
                    onChange={(e) =>
                      handleFollowUpChange(email.id, "content", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`follow-delay-${email.id}`}>Wait Time</Label>
                  <Select
                    value={email.delay}
                    onValueChange={(value) =>
                      handleFollowUpChange(email.id, "delay", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select wait time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1day">1 Day After</SelectItem>
                      <SelectItem value="3days">3 Days After</SelectItem>
                      <SelectItem value="1week">1 Week After</SelectItem>
                      <SelectItem value="2weeks">2 Weeks After</SelectItem>
                      <SelectItem value="custom">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Switch
                      checked={email.sendIfNoResponse}
                      onCheckedChange={(checked) =>
                        handleFollowUpChange(
                          email.id,
                          "sendIfNoResponse",
                          checked,
                        )
                      }
                    />
                    Only send if no response
                  </Label>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="call" className="space-y-6">
          <Card className="p-4 border-2 border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold">Call Scheduling</h4>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  Phone Integration
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCallScriptVisible(!callScriptVisible)}
              >
                {callScriptVisible ? "Hide Script" : "Show Script"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="call-timing">Call After</Label>
                <Select
                  value={callSettings.timing}
                  onValueChange={(value) =>
                    handleCallSettingChange("timing", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email1">Initial Email</SelectItem>
                    <SelectItem value="email2">Follow-up #1</SelectItem>
                    <SelectItem value="email3">Follow-up #2</SelectItem>
                    <SelectItem value="custom">Custom Timing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="call-delay">Wait Time</Label>
                <Select
                  value={callSettings.delay}
                  onValueChange={(value) =>
                    handleCallSettingChange("delay", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select wait time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1day">1 Day After</SelectItem>
                    <SelectItem value="3days">3 Days After</SelectItem>
                    <SelectItem value="1week">1 Week After</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {callScriptVisible && (
              <div className="space-y-2 mb-4">
                <Label htmlFor="call-script">Call Script</Label>
                <Textarea
                  id="call-script"
                  placeholder="Enter your call script here..."
                  className="min-h-[200px]"
                  value={callSettings.script}
                  onChange={(e) =>
                    handleCallSettingChange("script", e.target.value)
                  }
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Switch
                    checked={callSettings.skipIfOpened}
                    onCheckedChange={(checked) =>
                      handleCallSettingChange("skipIfOpened", checked)
                    }
                  />
                  Skip call if email is opened
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Switch
                    checked={callSettings.logToCrm}
                    onCheckedChange={(checked) =>
                      handleCallSettingChange("logToCrm", checked)
                    }
                  />
                  Log call outcomes to CRM
                </Label>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">
              Call Scheduling Calendar
            </h4>
            <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Call scheduling calendar will appear here
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">Sequence Performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border rounded-md text-center">
                <h5 className="text-sm font-medium text-muted-foreground mb-1">
                  Open Rate
                </h5>
                <p className="text-3xl font-bold">42%</p>
              </div>
              <div className="p-4 border rounded-md text-center">
                <h5 className="text-sm font-medium text-muted-foreground mb-1">
                  Response Rate
                </h5>
                <p className="text-3xl font-bold">18%</p>
              </div>
              <div className="p-4 border rounded-md text-center">
                <h5 className="text-sm font-medium text-muted-foreground mb-1">
                  Meeting Rate
                </h5>
                <p className="text-3xl font-bold">5%</p>
              </div>
            </div>
            <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center mb-4">
              <div className="text-center">
                <BarChart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Performance chart will appear here
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">Audience Insights</h4>
            <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
              <div className="text-center">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Audience insights will appear here
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">Sequence Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 border-b">
                <div>
                  <h5 className="font-medium">Auto-pause if reply detected</h5>
                  <p className="text-sm text-muted-foreground">
                    Automatically pause sequence when a reply is detected
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-2 border-b">
                <div>
                  <h5 className="font-medium">Working hours only</h5>
                  <p className="text-sm text-muted-foreground">
                    Only send emails during working hours (9am-5pm)
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-2 border-b">
                <div>
                  <h5 className="font-medium">Weekend exclusion</h5>
                  <p className="text-sm text-muted-foreground">
                    Don't send emails on weekends
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-2 border-b">
                <div>
                  <h5 className="font-medium">CRM integration</h5>
                  <p className="text-sm text-muted-foreground">
                    Sync all activities with your CRM
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-2">
                <div>
                  <h5 className="font-medium">Email tracking</h5>
                  <p className="text-sm text-muted-foreground">
                    Track opens, clicks, and replies
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
