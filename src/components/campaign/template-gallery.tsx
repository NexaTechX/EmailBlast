import { useState } from "react";
import { Card } from "@/components/ui/card";
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
import { Eye, Check } from "lucide-react";

interface TemplateGalleryProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateGallery({ onSelectTemplate, open, onOpenChange }: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  const categories = {
    all: emailTemplates,
    newsletter: emailTemplates.filter(t => t.category === "newsletter"),
    promotional: emailTemplates.filter(t => t.category === "promotional"),
    transactional: emailTemplates.filter(t => t.category === "transactional"),
    announcement: emailTemplates.filter(t => t.category === "announcement"),
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose an Email Template</DialogTitle>
            <DialogDescription>
              Select a professionally designed template to get started quickly
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
              <TabsTrigger value="promotional">Promotional</TabsTrigger>
              <TabsTrigger value="transactional">Transactional</TabsTrigger>
              <TabsTrigger value="announcement">Announcement</TabsTrigger>
            </TabsList>

            {Object.entries(categories).map(([key, templates]) => (
              <TabsContent key={key} value={key} className="mt-6">
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-6xl">
                        {template.thumbnail}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {template.description}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handlePreview(template)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleSelectTemplate(template)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg overflow-auto max-h-[60vh] bg-white">
            {selectedTemplate && (
              <div dangerouslySetInnerHTML={{ __html: selectedTemplate.html }} />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            {selectedTemplate && (
              <Button onClick={() => {
                handleSelectTemplate(selectedTemplate);
                setPreviewOpen(false);
              }}>
                <Check className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

