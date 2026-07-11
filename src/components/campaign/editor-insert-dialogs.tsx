import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LinkInsertDialog({
  open,
  onOpenChange,
  initialUrl = "",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  onConfirm: (url: string) => void;
}) {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    if (open) setUrl(initialUrl || "https://");
  }, [open, initialUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert link</DialogTitle>
          <DialogDescription>
            Select text first, then add the destination URL.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="link-url">URL</Label>
          <Input
            id="link-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            onKeyDown={(e) => {
              if (e.key === "Enter" && url.trim()) {
                onConfirm(url.trim());
                onOpenChange(false);
              }
            }}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!url.trim()}
            onClick={() => {
              onConfirm(url.trim());
              onOpenChange(false);
            }}
          >
            Apply link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ImageInsertDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string, alt: string) => void;
}) {
  const [url, setUrl] = useState("https://");
  const [alt, setAlt] = useState("");

  useEffect(() => {
    if (open) {
      setUrl("https://");
      setAlt("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert image</DialogTitle>
          <DialogDescription>
            Use a publicly reachable image URL (HTTPS recommended).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-alt">Alt text</Label>
            <Input
              id="image-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!url.trim() || url.trim() === "https://"}
            onClick={() => {
              onConfirm(url.trim(), alt.trim() || "Email image");
              onOpenChange(false);
            }}
          >
            Insert image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SaveTemplateDialog({
  open,
  onOpenChange,
  defaultName,
  onConfirm,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  onConfirm: (name: string) => void;
  saving?: boolean;
}) {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) setName(defaultName || "My template");
  }, [open, defaultName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as template</DialogTitle>
          <DialogDescription>
            Reuse this HTML later from Templates → Saved.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="template-name">Template name</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) onConfirm(name.trim());
            }}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || saving}
            onClick={() => onConfirm(name.trim())}
          >
            {saving ? "Saving…" : "Save template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
