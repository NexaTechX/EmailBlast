import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Lock,
  Key,
  AlertTriangle,
  Fingerprint,
  RefreshCw,
} from "lucide-react";

export function SecuritySettings() {
  const [securityScore, setSecurityScore] = useState(75);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleEnableTwoFactor = () => {
    setShowQRCode(true);
  };

  const handleVerifyTwoFactor = () => {
    setVerifying(true);
    // Simulate verification
    setTimeout(() => {
      setVerifying(false);
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      setSecurityScore(95);
    }, 1500);
  };

  const handleDisableTwoFactor = () => {
    setTwoFactorEnabled(false);
    setSecurityScore(75);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Security Settings</h2>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold">Security Overview</h3>
            <p className="text-sm text-muted-foreground">
              Manage your account security settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              Security Score: {securityScore}%
            </span>
          </div>
        </div>

        <div className="mb-6">
          <Progress value={securityScore} className="h-2" />
        </div>

        <Tabs defaultValue="authentication">
          <TabsList className="mb-6">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="authentication" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Last changed 30 days ago
                    </p>
                  </div>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorEnabled
                        ? "Your account is protected with 2FA"
                        : "Add an extra layer of security to your account"}
                    </p>
                  </div>
                </div>
                {twoFactorEnabled ? (
                  <Button variant="outline" onClick={handleDisableTwoFactor}>
                    Disable 2FA
                  </Button>
                ) : (
                  <Button onClick={handleEnableTwoFactor}>Enable 2FA</Button>
                )}
              </div>

              {showQRCode && (
                <div className="p-4 border rounded-md space-y-4">
                  <h4 className="font-medium">
                    Set Up Two-Factor Authentication
                  </h4>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                      <p className="text-sm text-gray-500">
                        QR Code Placeholder
                      </p>
                    </div>
                    <p className="text-sm text-center max-w-md">
                      Scan this QR code with your authenticator app (like Google
                      Authenticator or Authy), then enter the verification code
                      below.
                    </p>
                    <div className="w-full max-w-xs space-y-2">
                      <Label htmlFor="verification-code">
                        Verification Code
                      </Label>
                      <Input
                        id="verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowQRCode(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleVerifyTwoFactor}
                        disabled={verificationCode.length !== 6 || verifying}
                      >
                        {verifying ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        {verifying ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h4 className="font-medium">Recovery Options</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up recovery methods for your account
                    </p>
                  </div>
                </div>
                <Button variant="outline">Manage Recovery</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">API Keys</h4>
                <Button size="sm">Create New Key</Button>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Created</th>
                      <th className="text-left p-3 font-medium">Last Used</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">Production API Key</td>
                      <td className="p-3">2023-10-15</td>
                      <td className="p-3">Today</td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">
                          Revoke
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Development API Key</td>
                      <td className="p-3">2023-09-01</td>
                      <td className="p-3">Yesterday</td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 border rounded-md space-y-2">
                <h4 className="font-medium">API Rate Limits</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Requests per minute</span>
                    <span className="font-medium">60/60</span>
                  </div>
                  <Progress value={100} className="h-1" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Requests per day</span>
                    <span className="font-medium">8,543/10,000</span>
                  </div>
                  <Progress value={85.43} className="h-1" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Active Sessions</h4>

              <div className="space-y-3">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">C</span>
                      </div>
                      <div>
                        <h5 className="font-medium">Current Session</h5>
                        <p className="text-xs text-muted-foreground">
                          Chrome on Windows • IP: 192.168.1.1
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Active Now
                    </Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-bold">S</span>
                      </div>
                      <div>
                        <h5 className="font-medium">Safari on MacOS</h5>
                        <p className="text-xs text-muted-foreground">
                          Last active: 2 days ago • IP: 192.168.1.2
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-bold">F</span>
                      </div>
                      <div>
                        <h5 className="font-medium">Firefox on Android</h5>
                        <p className="text-xs text-muted-foreground">
                          Last active: 5 days ago • IP: 192.168.1.3
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Revoke All Other Sessions
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Security Audit Log</h4>
                <Button variant="outline" size="sm">
                  Export Log
                </Button>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Event</th>
                      <th className="text-left p-3 font-medium">IP Address</th>
                      <th className="text-left p-3 font-medium">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">Login successful</td>
                      <td className="p-3">192.168.1.1</td>
                      <td className="p-3">Today, 10:23 AM</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Password changed</td>
                      <td className="p-3">192.168.1.1</td>
                      <td className="p-3">30 days ago, 2:45 PM</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">API key created</td>
                      <td className="p-3">192.168.1.2</td>
                      <td className="p-3">2023-09-01, 11:32 AM</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Failed login attempt</td>
                      <td className="p-3">203.0.113.1</td>
                      <td className="p-3">2023-08-15, 3:12 AM</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
