import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { emailTemplates, type EmailTemplate } from "@/lib/email-templates";
import {
  listSavedTemplates,
  savedToGalleryTemplate,
  deleteSavedTemplate,
} from "@/lib/user-templates";
import { Eye, Check, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TemplateGalleryProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateGallery({
  onSelectTemplate,
  open,
  onOpenChange,
}: TemplateGalleryProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saved, setSaved] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    if (!open) return;
    listSavedTemplates()
      .then((rows) => setSaved(rows.map(savedToGalleryTemplate)))
      .catch((err) => {
        console.error(err);
        setSaved([]);
      });
  }, [open]);

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  const handleDeleteSaved = async (id: string) => {
    if (!confirm("Delete this saved template?")) return;
    try {
      await deleteSavedTemplate(id);
      setSaved((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Template deleted" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    }
  };

  const categories = {
    all: [...saved, ...emailTemplates],
    saved,
    newsletter: emailTemplates.filter((t) => t.category === "newsletter"),
    promotional: emailTemplates.filter((t) => t.category === "promotional"),
    transactional: emailTemplates.filter((t) => t.category === "transactional"),
    announcement: emailTemplates.filter((t) => t.category === "announcement"),
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Templates</DialogTitle>
            <DialogDescription>
              Starters and templates you’ve saved from the editor.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
              {(
                [
                  ["all", "All"],
                  ["saved", "Saved"],
                  ["newsletter", "Newsletter"],
                  ["promotional", "Promo"],
                  ["transactional", "Transactional"],
                  ["announcement", "Announce"],
                ] as const
              ).map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-md border border-transparent px-2.5 py-1 text-xs data-[state=active]:border-border data-[state=active]:bg-muted"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(categories).map(([key, templates]) => (
              <TabsContent key={key} value={key} className="mt-4">
                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {key === "saved"
                      ? "No saved templates yet. Use Save template in the editor."
                      : "No templates in this category."}
                  </p>
                ) : (
                  <ul className="divide-y divide-border rounded-md border border-border">
                    {templates.map((template) => (
                      <li
                        key={template.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold tracking-tight">
                              {template.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] uppercase tracking-wide"
                            >
                              {template.category}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => handlePreview(template)}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => handleSelectTemplate(template)}
                          >
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                            Use
                          </Button>
                          {key === "saved" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteSaved(template.id)}
                              aria-label="Delete template"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          <div
            className="email-preview-body max-h-[60vh] overflow-auto rounded-md border border-border bg-card p-4"
            dangerouslySetInnerHTML={{
              __html: selectedTemplate?.html || "",
            }}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            {selectedTemplate && (
              <Button
                onClick={() => {
                  handleSelectTemplate(selectedTemplate);
                  setPreviewOpen(false);
                }}
              >
                Use template
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
