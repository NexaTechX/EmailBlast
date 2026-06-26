import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { ImportSubscribers } from "./import-subscribers";
import {
  Search,
  UserPlus,
  Download,
  Trash2,
  Users,
  ArrowLeft,
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

const TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "unsubscribed", label: "Unsubscribed" },
] as const;

// Audience view: lists, filters, selects, imports and deletes subscribers.
export function SubscriberLists() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showImport, setShowImport] = useState(false);
  const { toast } = useToast();

  // Loads subscribers for the active tab (all / active / unsubscribed).
  const loadSubscribers = async () => {
    setLoading(true);
    try {
      let query = supabase.from("subscribers").select("*");
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

  useEffect(() => {
    loadSubscribers();
  }, [activeTab]);

  // Toggles a subscriber in/out of the current selection.
  const toggleSelectSubscriber = (id: string) => {
    setSelectedSubscribers((prev) =>
      prev.includes(id) ? prev.filter((subId) => subId !== id) : [...prev, id],
    );
  };

  // Deletes the selected subscribers after a confirmation prompt.
  const handleDeleteSelected = async () => {
    if (!selectedSubscribers.length) return;
    if (
      // skipcq: JS-0052 — native confirm is an intentional guard for a destructive, irreversible delete.
      !confirm(
        `Delete ${selectedSubscribers.length} subscriber(s)? This can't be undone.`,
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
        description: `${selectedSubscribers.length} removed.`,
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

  const allChecked =
    filteredSubscribers.length > 0 &&
    selectedSubscribers.length === filteredSubscribers.length;

  // Renders a subscriber's display name, or an em dash when unknown.
  const fullName = (s: Subscriber) =>
    s.first_name || s.last_name
      ? `${s.first_name || ""} ${s.last_name || ""}`.trim()
      : "—";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Audience
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Subscribers
          </h2>
        </div>
        {showImport ? (
          <Button variant="outline" onClick={() => setShowImport(false)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to list
          </Button>
        ) : (
          <Button onClick={() => setShowImport(true)}>
            <UserPlus className="mr-1.5 h-4 w-4" />
            Import subscribers
          </Button>
        )}
      </div>

      {showImport ? (
        <ImportSubscribers />
      ) : (
        <>
          {/* Toolbar: segmented tabs + search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-lg border p-1">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveTab(t.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === t.value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subscribers…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border">
            <div className="hidden items-center gap-4 border-b px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:flex">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded"
                checked={allChecked}
                onChange={() =>
                  setSelectedSubscribers(
                    allChecked ? [] : filteredSubscribers.map((s) => s.id),
                  )
                }
              />
              <span className="flex-1">Email</span>
              <span className="w-40">Name</span>
              <span className="w-28">Status</span>
              <span className="w-24">Added</span>
              <span className="w-8" />
            </div>

            {loading ? (
              <div className="divide-y">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium">No subscribers found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {searchQuery
                    ? "No subscribers match your search."
                    : "Import a CSV to add your audience."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5"
                  onClick={() => setShowImport(true)}
                >
                  Import subscribers
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {filteredSubscribers.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded"
                      checked={selectedSubscribers.includes(s.id)}
                      onChange={() => toggleSelectSubscriber(s.id)}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {s.email}
                    </span>
                    <span className="hidden w-40 truncate text-sm text-muted-foreground sm:block">
                      {fullName(s)}
                    </span>
                    <span className="hidden w-28 items-center gap-1.5 font-mono text-xs text-muted-foreground sm:inline-flex">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          s.unsubscribed_at
                            ? "bg-muted-foreground/40"
                            : "bg-emerald-500"
                        }`}
                      />
                      {s.unsubscribed_at ? "Unsubscribed" : "Active"}
                    </span>
                    <span className="hidden w-24 font-mono text-xs text-muted-foreground sm:block">
                      {new Date(s.subscribed_at).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          {filteredSubscribers.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="font-mono text-xs text-muted-foreground">
                {selectedSubscribers.length > 0
                  ? `${selectedSubscribers.length} selected`
                  : `${filteredSubscribers.length} subscribers`}
              </p>
              <div className="flex gap-2">
                {selectedSubscribers.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Delete
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Download className="mr-1.5 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
