import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import CampaignDetailsForm, {
  type CampaignDetails,
} from "./CampaignDetailsForm";
import RichTextEditor from "./RichTextEditor";
import CampaignPreview from "./CampaignPreview";
import { AIContentGenerator } from "../ai/ai-content-generator";
import { ComplianceChecker } from "../compliance/compliance-checker";
import { TemplateGallery } from "./template-gallery";
import { SaveTemplateDialog } from "./editor-insert-dialogs";
import {
  FileText,
  Save,
  Eye,
  ShieldCheck,
  Wand2,
  X,
} from "lucide-react";
import type { EmailTemplate } from "@/lib/email-templates";
import { saveEmailTemplate } from "@/lib/user-templates";
import { insertPersonalization } from "@/lib/groq-api";
import { cn } from "@/lib/utils";
import { analyzeCompliance } from "@/lib/compliance";

type SidePanel = "none" | "preview" | "assist" | "check";

interface EnhancedCampaignEditorProps {
  onContentChange?: (content: string) => void;
  onDetailsChange?: (details: CampaignDetails) => void;
  initialContent?: string;
  initialDetails?: CampaignDetails;
}

const PANEL_META: Record<
  Exclude<SidePanel, "none">,
  { label: string; icon: typeof Eye }
> = {
  preview: { label: "Preview", icon: Eye },
  assist: { label: "Assist", icon: Wand2 },
  check: { label: "Check", icon: ShieldCheck },
};

const EnhancedCampaignEditor = ({
  onContentChange = () => {},
  onDetailsChange = () => {},
  initialContent = "",
  initialDetails = {
    subject: "",
    senderName: "",
    senderEmail: "",
    subscriberList: "",
  },
}: EnhancedCampaignEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [details, setDetails] = useState(initialDetails);
  const [panel, setPanel] = useState<SidePanel>("none");
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [personalizing, setPersonalizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    setDetails(initialDetails);
  }, [initialDetails]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange(newContent);
  };

  const handleDetailsChange = (newDetails: CampaignDetails) => {
    setDetails(newDetails);
    onDetailsChange(newDetails);
  };

  const togglePanel = (next: Exclude<SidePanel, "none">) => {
    setPanel((prev) => (prev === next ? "none" : next));
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    handleContentChange(template.html);
    toast({
      title: "Template applied",
      description: `"${template.name}" replaced the email body.`,
    });
    setTemplateGalleryOpen(false);
  };

  const handleSaveAsTemplate = async (name: string) => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Empty content",
        description: "Add email content before saving a template.",
      });
      return;
    }
    setSavingTemplate(true);
    try {
      await saveEmailTemplate({
        name,
        content,
        description: "Saved from campaign editor",
        category: "newsletter",
      });
      toast({
        title: "Template saved",
        description: "Find it under Templates → Saved.",
      });
      setSaveTemplateOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handlePersonalize = async () => {
    setPersonalizing(true);
    try {
      const html = await insertPersonalization(content);
      handleContentChange(html);
      toast({
        title: "Merge tags added",
        description: "Review personalization before sending.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Personalization failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setPersonalizing(false);
    }
  };

  const complianceScore = analyzeCompliance(content, details.subject).score;

  return (
    <>
      <TemplateGallery
        open={templateGalleryOpen}
        onOpenChange={setTemplateGalleryOpen}
        onSelectTemplate={handleSelectTemplate}
      />
      <SaveTemplateDialog
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        defaultName={details.subject || "My template"}
        onConfirm={handleSaveAsTemplate}
        saving={savingTemplate}
      />

      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        {/* Compact chrome: tools + meta in ~2 short rows */}
        <div className="shrink-0 space-y-2 border-b border-border px-3 py-2 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setTemplateGalleryOpen(true)}
              >
                <FileText className="mr-1 h-3.5 w-3.5" />
                Templates
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setSaveTemplateOpen(true)}
              >
                <Save className="mr-1 h-3.5 w-3.5" />
                Save template
              </Button>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              {(Object.keys(PANEL_META) as Exclude<SidePanel, "none">[]).map(
                (key) => {
                  const meta = PANEL_META[key];
                  const Icon = meta.icon;
                  const active = panel === key;
                  return (
                    <Button
                      key={key}
                      type="button"
                      variant={active ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-7 px-2 text-xs",
                        active && "bg-signal-soft text-accent-foreground",
                      )}
                      onClick={() => togglePanel(key)}
                    >
                      <Icon className="mr-1 h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{meta.label}</span>
                      {key === "check" && (
                        <span className="ml-1 font-mono text-[10px] tabular-nums text-muted-foreground">
                          {complianceScore}
                        </span>
                      )}
                    </Button>
                  );
                },
              )}
            </div>
          </div>

          <CampaignDetailsForm
            onDetailsChange={handleDetailsChange}
            initialDetails={details}
          />
        </div>

        {/* Workspace — must own remaining height + scroll */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
              panel !== "none" && "hidden lg:flex",
            )}
          >
            <RichTextEditor content={content} onChange={handleContentChange} />
          </div>

          {panel !== "none" && (
            <aside className="flex w-full min-h-0 flex-col border-l border-border bg-muted/20 lg:w-[380px] xl:w-[420px]">
              <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
                <p className="text-sm font-medium tracking-tight">
                  {PANEL_META[panel].label}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPanel("none")}
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-4">
                {panel === "preview" && (
                  <CampaignPreview
                    content={content}
                    subject={details.subject}
                    senderName={details.senderName}
                    senderEmail={details.senderEmail}
                    embedded
                  />
                )}
                {panel === "assist" && (
                  <div className="space-y-6">
                    <AIContentGenerator
                      currentContent={content}
                      currentSubject={details.subject}
                      onSelectContent={handleContentChange}
                      onSelectSubject={(subject) =>
                        handleDetailsChange({ ...details, subject })
                      }
                    />
                    <div className="border-t border-border pt-4">
                      <p className="mb-2 text-xs text-muted-foreground">
                        Place {"{{first_name}}"} and related tags into the body.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={personalizing || !content.trim()}
                        onClick={handlePersonalize}
                      >
                        {personalizing ? "Working…" : "Add merge tags with AI"}
                      </Button>
                    </div>
                  </div>
                )}
                {panel === "check" && (
                  <ComplianceChecker
                    content={content}
                    subject={details.subject}
                    onContentChange={handleContentChange}
                    compact
                  />
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
};

export default EnhancedCampaignEditor;
