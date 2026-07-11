import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  generateContent as generateAiContent,
  suggestSubjects,
  type SubjectSuggestion,
} from "@/lib/groq-api";

interface AIContentGeneratorProps {
  onSelectContent?: (content: string) => void;
  onSelectSubject?: (subject: string) => void;
  currentContent?: string;
  currentSubject?: string;
}

export function AIContentGenerator({
  onSelectContent = () => {},
  onSelectSubject = () => {},
  currentContent = "",
  currentSubject = "",
}: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<SubjectSuggestion[]>([]);
  const { toast } = useToast();

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Describe the email",
        description: "A short brief produces better draft copy.",
      });
      return;
    }

    setLoading(true);
    try {
      const generatedContent = await generateAiContent(prompt);
      setSuggestions([generatedContent]);
      toast({
        title: "Draft ready",
        description: "Review it, then apply to the campaign body.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSubjects = async () => {
    if (!currentContent.trim()) {
      toast({
        variant: "destructive",
        title: "No email body",
        description: "Write content first, then suggest subjects.",
      });
      return;
    }
    setLoading(true);
    try {
      const list = await suggestSubjects({
        content: currentContent,
        subject: currentSubject,
        tone: "professional",
      });
      setSubjects(list);
      toast({
        title: "Subjects ready",
        description: `${list.length} options generated.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Subject suggestions failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="content">
        <TabsList className="h-8 w-full">
          <TabsTrigger value="content" className="flex-1 text-xs">
            Body
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex-1 text-xs">
            Subjects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-3 space-y-3">
          <Textarea
            placeholder="Brief: welcome new subscribers, soft CTA to book a demo…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] text-sm"
          />
          <Button
            onClick={generateContent}
            disabled={loading || !prompt.trim()}
            className="w-full"
            size="sm"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate draft"
            )}
          </Button>

          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="space-y-2 rounded-md border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Draft
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={() => {
                    onSelectContent(suggestion);
                    toast({ title: "Applied to body" });
                  }}
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Use
                </Button>
              </div>
              <div
                className="email-preview-body max-h-[160px] overflow-hidden text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: suggestion }}
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="subjects" className="mt-3 space-y-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Suggest subject lines from the current body. Apply one here or copy
            into A/B Testing.
          </p>
          <Button
            onClick={generateSubjects}
            disabled={loading}
            className="w-full"
            size="sm"
            variant="secondary"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                Suggesting…
              </>
            ) : (
              "Suggest subjects"
            )}
          </Button>
          {subjects.map((s, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-2 rounded-md border border-border bg-background p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">{s.subject}</p>
                {s.preview ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.preview}
                  </p>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 shrink-0 text-xs"
                onClick={() => {
                  onSelectSubject(s.subject);
                  toast({ title: "Subject applied" });
                }}
              >
                Use
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
