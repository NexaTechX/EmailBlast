import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  Mail,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  avatar?: string;
  status: "active" | "invited" | "inactive";
  lastActive?: string;
}

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "owner",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      status: "active",
      lastActive: "Today at 10:30 AM",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "admin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      status: "active",
      lastActive: "Yesterday at 3:45 PM",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "editor",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      status: "active",
      lastActive: "3 days ago",
    },
    {
      id: "4",
      name: "Sarah Williams",
      email: "sarah@example.com",
      role: "viewer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      status: "invited",
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("editor");
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const handleInvite = () => {
    if (!inviteEmail) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "invited",
    };

    setMembers([...members, newMember]);
    setInviteEmail("");
    setShowInviteDialog(false);
  };

  const handleRoleChange = (memberId: string, newRole: TeamMember["role"]) => {
    setMembers(
      members.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member,
      ),
    );
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter((member) => member.id !== memberId));
  };

  const getRoleBadgeColor = (role: TeamMember["role"]) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "editor":
        return "bg-green-100 text-green-800 border-green-200";
      case "viewer":
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Team Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage your team members and their permissions
          </p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(value) =>
                    setInviteRole(value as TeamMember["role"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {inviteRole === "admin" &&
                    "Can manage team members and all content"}
                  {inviteRole === "editor" &&
                    "Can create and edit campaigns, but cannot manage team"}
                  {inviteRole === "viewer" &&
                    "Can only view campaigns and reports"}
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleInvite}
                disabled={!inviteEmail}
              >
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="mb-6">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <div className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Last Active</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {member.role === "owner" ? (
                          <Badge
                            variant="outline"
                            className={getRoleBadgeColor(member.role)}
                          >
                            Owner
                          </Badge>
                        ) : (
                          <Select
                            value={member.role}
                            onValueChange={(value) =>
                              handleRoleChange(
                                member.id,
                                value as TeamMember["role"],
                              )
                            }
                          >
                            <SelectTrigger className="w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="p-3">
                        {member.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Active
                          </Badge>
                        ) : member.status === "invited" ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Invited
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {member.lastActive ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{member.lastActive}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3">
                        {member.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            {member.status === "invited" ? "Cancel" : "Remove"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <h4 className="font-medium">Owner</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Full access to all settings and features. Can manage billing,
                  team members, and all content.
                </p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Manage billing and subscription
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Add/remove team members
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Manage all campaigns and content
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Access all reports and analytics
                  </li>
                </ul>
              </div>

              <div className="p-4 border rounded-md space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Admin</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Can manage team members and all content, but cannot access
                  billing settings.
                </p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Add/remove team members
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Manage all campaigns and content
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Access all reports and analytics
                  </li>
                </ul>
              </div>

              <div className="p-4 border rounded-md space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Editor</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Can create and edit campaigns, but cannot manage team members
                  or billing.
                </p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Create and edit campaigns
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Manage subscriber lists
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    View reports and analytics
                  </li>
                </ul>
              </div>

              <div className="p-4 border rounded-md space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <h4 className="font-medium">Viewer</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Read-only access to campaigns and reports. Cannot create or
                  edit content.
                </p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    View campaigns and content
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    View reports and analytics
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Team Activity Log</h4>
              <Button variant="outline" size="sm">
                Export Log
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Action</th>
                    <th className="text-left p-3 font-medium">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=john" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span>John Doe</span>
                      </div>
                    </td>
                    <td className="p-3">Created new campaign "Summer Sale"</td>
                    <td className="p-3">Today, 10:23 AM</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=jane" />
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <span>Jane Smith</span>
                      </div>
                    </td>
                    <td className="p-3">Invited Sarah Williams to the team</td>
                    <td className="p-3">Yesterday, 3:45 PM</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=mike" />
                          <AvatarFallback>MJ</AvatarFallback>
                        </Avatar>
                        <span>Mike Johnson</span>
                      </div>
                    </td>
                    <td className="p-3">Edited campaign "Product Launch"</td>
                    <td className="p-3">3 days ago, 11:32 AM</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=john" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span>John Doe</span>
                      </div>
                    </td>
                    <td className="p-3">
                      Changed Mike Johnson's role to Editor
                    </td>
                    <td className="p-3">1 week ago, 2:15 PM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
