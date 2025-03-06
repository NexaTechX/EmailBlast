import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { ImportSubscribers } from "./import-subscribers";
import {
  Search,
  UserPlus,
  Download,
  Trash,
  RefreshCw,
  Mail,
  Tag,
  Filter,
  MoreHorizontal,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  job_title: string;
  tags: string[];
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export function SubscriberLists() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showImport, setShowImport] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscribers();
  }, [activeTab]);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      // Database tables should already be set up by setupDatabase in App.tsx

      let query = supabase.from("subscribers").select("*");

      // Apply filters based on active tab
      if (activeTab === "active") {
        query = query.is("unsubscribed_at", null);
      } else if (activeTab === "unsubscribed") {
        query = query.not("unsubscribed_at", "is", null);
      }

      const { data, error } = await query.order("subscribed_at", {
        ascending: false,
      });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error("Error loading subscribers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load subscribers. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter subscribers client-side for now
    // In a real app, you'd want to do this on the server
  };

  const toggleSelectSubscriber = (id: string) => {
    setSelectedSubscribers((prev) =>
      prev.includes(id) ? prev.filter((subId) => subId !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedSubscribers.length) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedSubscribers.length} subscribers? This action cannot be undone.`,
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("subscribers")
        .delete()
        .in("id", selectedSubscribers);

      if (error) throw error;

      toast({
        title: "Subscribers deleted",
        description: `${selectedSubscribers.length} subscribers have been deleted.`,
      });

      setSelectedSubscribers([]);
      loadSubscribers();
    } catch (error) {
      console.error("Error deleting subscribers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete subscribers. Please try again.",
      });
    }
  };

  const filteredSubscribers = searchQuery
    ? subscribers.filter(
        (sub) =>
          sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${sub.first_name} ${sub.last_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (sub.company &&
            sub.company.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : subscribers;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Subscribers</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(!showImport)}>
            {showImport ? "View Subscribers" : "Import Subscribers"}
          </Button>
          <Button onClick={() => setShowImport(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Subscriber
          </Button>
        </div>
      </div>

      {showImport ? (
        <ImportSubscribers />
      ) : (
        <>
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="all">All Subscribers</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="unsubscribed">Unsubscribed</TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input
                        placeholder="Search subscribers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-[250px]"
                      />
                      <Button type="submit" variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                    <Button variant="outline">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Tabs>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSubscribers.length > 0 ? (
              <>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left font-medium">
                          <input
                            type="checkbox"
                            className="rounded"
                            onChange={() => {
                              if (
                                selectedSubscribers.length ===
                                filteredSubscribers.length
                              ) {
                                setSelectedSubscribers([]);
                              } else {
                                setSelectedSubscribers(
                                  filteredSubscribers.map((sub) => sub.id),
                                );
                              }
                            }}
                            checked={
                              selectedSubscribers.length ===
                                filteredSubscribers.length &&
                              filteredSubscribers.length > 0
                            }
                          />
                        </th>
                        <th className="p-3 text-left font-medium">Email</th>
                        <th className="p-3 text-left font-medium">Name</th>
                        <th className="p-3 text-left font-medium">Company</th>
                        <th className="p-3 text-left font-medium">Tags</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">
                          Date Added
                        </th>
                        <th className="p-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscribers.map((subscriber) => (
                        <tr
                          key={subscriber.id}
                          className="border-t hover:bg-muted/20"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedSubscribers.includes(
                                subscriber.id,
                              )}
                              onChange={() =>
                                toggleSelectSubscriber(subscriber.id)
                              }
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{subscriber.email}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            {subscriber.first_name || subscriber.last_name
                              ? `${subscriber.first_name || ""} ${subscriber.last_name || ""}`
                              : "-"}
                          </td>
                          <td className="p-3">{subscriber.company || "-"}</td>
                          <td className="p-3">
                            {subscriber.tags && subscriber.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {subscriber.tags.slice(0, 2).map((tag, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {subscriber.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{subscriber.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-3">
                            {subscriber.unsubscribed_at ? (
                              <Badge
                                variant="outline"
                                className="text-xs bg-red-50 text-red-700 border-red-200"
                              >
                                Unsubscribed
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700 border-green-200"
                              >
                                Active
                              </Badge>
                            )}
                          </td>
                          <td className="p-3">
                            {new Date(
                              subscriber.subscribed_at,
                            ).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedSubscribers.length > 0
                      ? `${selectedSubscribers.length} selected`
                      : `${filteredSubscribers.length} subscribers`}
                  </div>
                  <div className="flex gap-2">
                    {selectedSubscribers.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteSelected}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No subscribers found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "No subscribers match your search criteria"
                    : "You don't have any subscribers yet"}
                </p>
                <Button onClick={() => setShowImport(true)}>
                  Import Subscribers
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
