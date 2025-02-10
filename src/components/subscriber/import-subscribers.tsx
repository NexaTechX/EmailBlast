import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";
import { parse } from "papaparse";
import { supabase } from "@/lib/supabase";

interface ImportSubscribersProps {
  listId: string;
  onSuccess: () => void;
}

export function ImportSubscribers({
  listId,
  onSuccess,
}: ImportSubscribersProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const text = await file.text();
      parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const subscribers = results.data.map((row: any) => ({
            email: row.email,
            first_name: row.first_name || row.firstName || "",
            last_name: row.last_name || row.lastName || "",
            metadata: {},
          }));

          const { error } = await supabase.rpc("import_subscribers", {
            p_list_id: listId,
            p_subscribers: subscribers,
          });

          if (error) throw error;

          toast({
            title: "Success",
            description: `${subscribers.length} subscribers imported successfully`,
          });

          setOpen(false);
          onSuccess();
        },
        error: (error) => {
          throw new Error(error.message);
        },
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to import subscribers",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" /> Import
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Subscribers</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with the following headers: email, first_name,
              last_name
            </p>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Maximum file size: 10MB
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
