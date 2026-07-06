import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  getSubscriberLists,
  createSubscriberList,
  updateSubscriberList,
  deleteSubscriberList,
  ensureDefaultSubscriberList,
} from "@/lib/api";
import type { SubscriberList } from "@/types";
import { ImportSubscribers } from "./import-subscribers";
import {
  Search,
  UserPlus,
  Download,
  Trash2,
  Users,
  ArrowLeft,
  MoreHorizontal,
  ListPlus,
  Pencil,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  list_id: string | null;
  company?: string;
  job_title?: string;
  metadata?: { company?: string; job_title?: string; phone?: string };
  tags: string[];
  subscribed_at: string;
  unsubscribed_at: string | null;
}

function normalizeSubscriber(raw: Record<string, unknown>): Subscriber {
  const meta = (raw.metadata as Subscriber["metadata"]) || {};
  const base = raw as unknown as Subscriber;
  return {
    ...base,
    company: base.company || meta.company || "",
    job_title: base.job_title || meta.job_title || "",
  };
}

const TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "unsubscribed", label: "Unsubscribed" },
] as const;

export function SubscriberLists() {
  const [lists, setLists] = useState<SubscriberList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showImport, setShowImport] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState("");
  const { toast } = useToast();

  const loadLists = async () => {
    try {
      let data = await getSubscriberLists();
      if (data.length === 0) {
        const created = await ensureDefaultSubscriberList();
        if (created) data = [created];
      }
      setLists(data);
      if (!selectedListId && data.length > 0) {
        setSelectedListId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading lists:", error);
    }
  };

  const loadSubscribers = async () => {
    if (!selectedListId) {
      setSubscribers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let query = supabase
        .from("subscribers")
        .select("*")
        .eq("list_id", selectedListId);
      if (activeTab === "active") {
        query = query.is("unsubscribed_at", null);
      } else if (activeTab === "unsubscribed") {
        query = query.not("unsubscribed_at", "is", null);
      }
      const { data, error } = await query.order("subscribed_at", {
        ascending: false,
      });
      if (error) throw error;
      setSubscribers((data || []).map((s) => normalizeSubscriber(s)));
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
    loadLists();
  }, []);

  useEffect(() => {
    loadSubscribers();
  }, [activeTab, selectedListId]);

  const handleCreateList = async () => {
    const name = newListName.trim();
    if (!name) return;
    try {
      const list = await createSubscriberList(name);
      setLists((prev) => [list, ...prev]);
      setSelectedListId(list.id);
      setNewListName("");
      toast({ title: "List created", description: `"${name}" is ready.` });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create list.",
      });
    }
  };

  const handleRenameList = async (id: string) => {
    const name = editListName.trim();
    if (!name) return;
    try {
      const updated = await updateSubscriberList(id, { name });
      setLists((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setEditingListId(null);
      toast({ title: "List renamed" });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to rename list.",
      });
    }
  };

  const handleDeleteList = async (id: string) => {
    if (lists.length <= 1) {
      toast({
        variant: "destructive",
        title: "Cannot delete",
        description: "You must keep at least one subscriber list.",
      });
      return;
    }
    if (!confirm("Delete this list? Subscribers will remain but lose list assignment."))
      return;
    try {
      await deleteSubscriberList(id);
      const remaining = lists.filter((l) => l.id !== id);
      setLists(remaining);
      setSelectedListId(remaining[0]?.id || "");
      toast({ title: "List deleted" });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete list.",
      });
    }
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
        description: "Failed to delete subscribers.",
      });
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm("Delete this subscriber? This can't be undone.")) return;
    try {
      const { error } = await supabase.from("subscribers").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Subscriber deleted" });
      loadSubscribers();
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete subscriber.",
      });
    }
  };

  const handleExport = () => {
    const rows = filteredSubscribers.map((s) => ({
      email: s.email,
      first_name: s.first_name || "",
      last_name: s.last_name || "",
      company: s.company || "",
      job_title: s.job_title || "",
      status: s.unsubscribed_at ? "unsubscribed" : "active",
      subscribed_at: s.subscribed_at,
    }));
    const header = Object.keys(rows[0] || {}).join(",");
    const csv = [
      header,
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  const fullName = (s: Subscriber) =>
    s.first_name || s.last_name
      ? `${s.first_name || ""} ${s.last_name || ""}`.trim()
      : "—";

  const selectedList = lists.find((l) => l.id === selectedListId);

  return (
    <div className="space-y-8">
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
          <Button onClick={() => setShowImport(true)} disabled={!selectedListId}>
            <UserPlus className="mr-1.5 h-4 w-4" />
            Import subscribers
          </Button>
        )}
      </div>

      {showImport && selectedListId ? (
        <ImportSubscribers
          listId={selectedListId}
          onComplete={() => {
            setShowImport(false);
            loadSubscribers();
            loadLists();
          }}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Subscriber list
              </label>
              <Select value={selectedListId} onValueChange={setSelectedListId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                  {lists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="New list name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <Button variant="outline" onClick={handleCreateList}>
                <ListPlus className="h-4 w-4" />
              </Button>
            </div>
            {selectedList && (
              <div className="flex gap-2">
                {editingListId === selectedList.id ? (
                  <>
                    <Input
                      value={editListName}
                      onChange={(e) => setEditListName(e.target.value)}
                      className="w-40"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleRenameList(selectedList.id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingListId(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Rename list"
                      onClick={() => {
                        setEditingListId(selectedList.id);
                        setEditListName(selectedList.name);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Delete list"
                      onClick={() => handleDeleteList(selectedList.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

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
                    : `Import contacts into "${selectedList?.name || "your list"}".`}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Delete ${s.email}`}
                      onClick={() => handleDeleteOne(s.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {filteredSubscribers.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="font-mono text-xs text-muted-foreground">
                {selectedSubscribers.length > 0
                  ? `${selectedSubscribers.length} selected`
                  : `${filteredSubscribers.length} in ${selectedList?.name || "list"}`}
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
                <Button variant="outline" size="sm" onClick={handleExport}>
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
