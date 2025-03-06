import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import Papa from "papaparse";
import {
  Upload,
  FileText,
  RefreshCw,
  Check,
  AlertTriangle,
  Mail,
  Database,
  UserPlus,
} from "lucide-react";

export function ImportSubscribers() {
  const [activeTab, setActiveTab] = useState("paste");
  const [csvData, setCsvData] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  }>({ total: 0, success: 0, failed: 0, errors: [] });
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (data: string) => {
    return new Promise((resolve, reject) => {
      Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error),
      });
    });
  };

  const importSubscribers = async () => {
    setImporting(true);
    setProgress(0);
    setImportResults({ total: 0, success: 0, failed: 0, errors: [] });

    try {
      let data;

      if (activeTab === "paste") {
        if (!csvData.trim()) {
          throw new Error("Please enter CSV data");
        }
        data = await parseCSV(csvData);
      } else {
        if (!file) {
          throw new Error("Please select a file");
        }
        const fileContent = await file.text();
        data = await parseCSV(fileContent);
      }

      const subscribers = data as any[];
      const total = subscribers.length;
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      // Database tables should already be set up by setupDatabase in App.tsx

      // Process subscribers in batches
      const batchSize = 100;
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        const formattedBatch = batch.map((sub) => ({
          email: sub.email?.toLowerCase().trim(),
          first_name: sub.first_name || sub.firstName || sub.firstname || "",
          last_name: sub.last_name || sub.lastName || sub.lastname || "",
          phone: sub.phone || sub.phoneNumber || sub.phone_number || "",
          company: sub.company || sub.organization || "",
          job_title:
            sub.job_title || sub.jobTitle || sub.title || sub.position || "",
          tags: sub.tags
            ? typeof sub.tags === "string"
              ? [sub.tags]
              : sub.tags
            : [],
        }));

        // Filter out invalid emails
        const validBatch = formattedBatch.filter((sub) => {
          const isValid =
            sub.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sub.email);
          if (!isValid && sub.email) {
            errors.push(`Invalid email: ${sub.email}`);
            failed++;
          }
          return isValid;
        });

        if (validBatch.length > 0) {
          const { error } = await supabase
            .from("subscribers")
            .upsert(validBatch, {
              onConflict: "email",
              ignoreDuplicates: false,
            });

          if (error) {
            console.error("Error importing subscribers:", error);
            errors.push(`Batch error: ${error.message}`);
            failed += validBatch.length;
          } else {
            success += validBatch.length;
          }
        }

        // Update progress
        const currentProgress = Math.min(
          100,
          Math.round(((i + batch.length) / total) * 100),
        );
        setProgress(currentProgress);
        setImportResults({ total, success, failed, errors });
      }

      toast({
        title: "Import complete",
        description: `Successfully imported ${success} subscribers. ${failed} failed.`,
      });
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: error.message || "An error occurred during import",
      });
    } finally {
      setImporting(false);
      setProgress(100);
    }
  };

  const handleManualAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }

    try {
      const { error } = await supabase.from("subscribers").insert({
        email: email.toLowerCase().trim(),
        first_name: firstName,
        last_name: lastName,
      });

      if (error) {
        if (error.code === "23505") {
          // Unique violation
          toast({
            variant: "destructive",
            title: "Duplicate email",
            description: "This email is already in your subscriber list",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Subscriber added",
          description: `${email} has been added to your subscriber list`,
        });

        // Reset form
        e.currentTarget.reset();
      }
    } catch (error: any) {
      console.error("Error adding subscriber:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "An error occurred while adding the subscriber",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Import Subscribers</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="paste">Paste CSV</TabsTrigger>
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="manual">Add Manually</TabsTrigger>
          <TabsTrigger value="leads">From Lead Finder</TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-data">Paste CSV Data</Label>
            <Textarea
              id="csv-data"
              placeholder="email,first_name,last_name\njohn@example.com,John,Doe\nsarah@example.com,Sarah,Smith"
              className="min-h-[200px] font-mono text-sm"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              CSV should include at least an 'email' column. Other recognized
              columns: first_name, last_name, phone, company, job_title, tags.
            </p>
          </div>

          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing subscribers...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button
            onClick={importSubscribers}
            disabled={importing || !csvData.trim()}
            className="w-full"
          >
            {importing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            {importing ? "Importing..." : "Import Subscribers"}
          </Button>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("csv-file")?.click()}
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing subscribers...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button
            onClick={importSubscribers}
            disabled={importing || !file}
            className="w-full"
          >
            {importing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            {importing ? "Importing..." : "Import Subscribers"}
          </Button>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <form onSubmit={handleManualAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" placeholder="John" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" placeholder="Doe" />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Subscriber
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Import from Lead Finder
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Use the Lead Finder tool to discover potential leads, then import
              them directly to your subscriber list.
            </p>
            <Button onClick={() => (window.location.href = "/app/lead-finder")}>
              Go to Lead Finder
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {importResults.total > 0 && (
        <div className="mt-6 p-4 border rounded-md">
          <h4 className="font-medium mb-2">Import Results</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>
                Successfully imported: {importResults.success} subscribers
              </span>
            </div>
            {importResults.failed > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>
                  Failed to import: {importResults.failed} subscribers
                </span>
              </div>
            )}
            {importResults.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Errors:</p>
                <ul className="text-sm text-muted-foreground mt-1 list-disc pl-5">
                  {importResults.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {importResults.errors.length > 5 && (
                    <li>
                      ...and {importResults.errors.length - 5} more errors
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
