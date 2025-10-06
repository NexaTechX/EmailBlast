import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Smartphone, QrCode, Download, Share2, Users } from "lucide-react";

export function MobileAppPreview() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Mobile App Preview</h3>
          <p className="text-sm text-muted-foreground">
            Preview and manage your mobile app experience
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200"
        >
          Available on iOS & Android
        </Badge>
      </div>

      <Tabs defaultValue="preview">
        <TabsList className="mb-6">
          <TabsTrigger value="preview">App Preview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="w-[280px] h-[580px] bg-gray-100 rounded-[36px] p-3 border-8 border-gray-300 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-300 rounded-b-xl"></div>
              <div className="w-full h-full bg-white rounded-[24px] overflow-hidden flex flex-col">
                <div className="h-12 bg-primary flex items-center justify-between px-4">
                  <span className="text-white font-medium">EmailBlast</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white opacity-70"></div>
                    <div className="w-2 h-2 rounded-full bg-white opacity-70"></div>
                    <div className="w-2 h-2 rounded-full bg-white opacity-70"></div>
                  </div>
                </div>
                <div className="flex-1 p-4 space-y-4">
                  <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Campaign Analytics</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-100 rounded-md w-3/4"></div>
                    <div className="h-8 bg-gray-100 rounded-md"></div>
                    <div className="h-8 bg-gray-100 rounded-md w-1/2"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-24 bg-gray-100 rounded-lg"></div>
                    <div className="h-24 bg-gray-100 rounded-lg"></div>
                  </div>
                </div>
                <div className="h-16 border-t flex items-center justify-around px-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-primary"></div>
                    <span className="text-xs text-gray-500">Home</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    <span className="text-xs text-gray-500">Campaigns</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    <span className="text-xs text-gray-500">Analytics</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    <span className="text-xs text-gray-500">Profile</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <h4 className="text-lg font-semibold">Mobile App Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Real-time campaign analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Push notifications for campaign events</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Draft and schedule campaigns on the go</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Subscriber growth tracking</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download App
                </Button>
                <Button variant="outline" className="flex-1">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-medium">Campaign Management</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>View all campaigns and their performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Create and edit draft campaigns</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Schedule campaigns for future sending</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Duplicate existing campaigns</span>
                </li>
              </ul>
            </Card>

            <Card className="p-4 border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-medium">Analytics & Reporting</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Real-time open and click tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Conversion and revenue attribution</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Subscriber growth and engagement metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Export reports as PDF or CSV</span>
                </li>
              </ul>
            </Card>

            <Card className="p-4 border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-medium">Notifications</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Push notifications for campaign completions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Performance milestone alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Subscriber activity notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Customizable notification preferences</span>
                </li>
              </ul>
            </Card>

            <Card className="p-4 border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-yellow-600" />
                </div>
                <h4 className="font-medium">Subscriber Management</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>View and search subscriber lists</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Add individual subscribers</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>View subscriber engagement history</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span>Manage subscriber tags and segments</span>
                </li>
              </ul>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="h-32 w-32 text-gray-400" />
              </div>

              <div className="space-y-4 flex-1">
                <h4 className="text-lg font-semibold">App Distribution</h4>
                <p className="text-muted-foreground">
                  Share the mobile app with your team members and clients. They
                  can download it from the app stores or scan the QR code.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button className="flex items-center gap-2">
                    <AppleIcon className="h-5 w-5" />
                    App Store
                  </Button>
                  <Button className="flex items-center gap-2">
                    <AndroidIcon className="h-5 w-5" />
                    Google Play
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Link
                  </Button>
                </div>
              </div>
            </div>

            <Card className="p-4 border">
              <h4 className="font-medium mb-4">Enterprise Distribution</h4>
              <p className="text-sm text-muted-foreground mb-4">
                For enterprise customers, we offer additional distribution
                options including private app stores and MDM solutions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-md text-center">
                  <h5 className="font-medium mb-2">Private App Store</h5>
                  <p className="text-xs text-muted-foreground">
                    Host the app on your company's private app store
                  </p>
                </div>
                <div className="p-3 border rounded-md text-center">
                  <h5 className="font-medium mb-2">MDM Deployment</h5>
                  <p className="text-xs text-muted-foreground">
                    Deploy via Mobile Device Management solutions
                  </p>
                </div>
                <div className="p-3 border rounded-md text-center">
                  <h5 className="font-medium mb-2">Custom Branding</h5>
                  <p className="text-xs text-muted-foreground">
                    White-label the app with your company branding
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline">Contact Sales</Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

// Icons
function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
      <path d="M10 2c1 .5 2 2 2 5" />
    </svg>
  );
}

function AndroidIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M10 9V5a2 2 0 0 1 4 0v4" />
      <path d="M7 9V5a2 2 0 0 1 4 0v4" />
      <path d="M17 9V5a2 2 0 0 1 4 0v4" />
      <path d="M5 9V5a2 2 0 0 1 4 0v4" />
      <path d="M12 13v3" />
      <path d="M8 13v5" />
      <path d="M16 13v5" />
    </svg>
  );
}

function BarChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function Bell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function Phone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function Copy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
