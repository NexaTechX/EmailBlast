import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExtension from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Heading2,
  Heading3,
  Unlink,
  Braces,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MERGE_TAGS } from "@/lib/merge-tags";
import {
  ImageInsertDialog,
  LinkInsertDialog,
} from "./editor-insert-dialogs";

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  className?: string;
}

function ToolBtn({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={onClick}
          aria-label={label}
          className={cn(
            "h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground",
            active && "bg-muted text-foreground",
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

const RichTextEditor = ({
  content = "",
  onChange = () => {},
  className,
}: RichTextEditorProps) => {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [linkInitial, setLinkInitial] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      UnderlineExtension,
      Placeholder.configure({
        placeholder: "Write the email body…",
      }),
      Image.configure({
        HTMLAttributes: {
          class: "email-editor-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "email-editor-link",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content:
      content ||
      "<p></p>",
    editorProps: {
      attributes: {
        class: "email-editor-prose focus:outline-none min-h-[280px]",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content || "<p></p>", false);
    }
  }, [content, editor]);

  if (!editor) return null;

  const openLinkDialog = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    setLinkInitial(prev || "https://");
    setLinkOpen(true);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("flex h-full min-h-0 flex-col overflow-hidden", className)}>
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-background/80 px-2 py-1.5 backdrop-blur-sm">
          <ToolBtn
            label="Undo"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            label="Redo"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="h-4 w-4" />
          </ToolBtn>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolBtn
            label="Heading"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            label="Subheading"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="h-4 w-4" />
          </ToolBtn>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolBtn
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline className="h-4 w-4" />
          </ToolBtn>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolBtn
            label="Align left"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            label="Align center"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            label="Align right"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="h-4 w-4" />
          </ToolBtn>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolBtn
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            label="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolBtn>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolBtn
            label="Link"
            active={editor.isActive("link")}
            onClick={openLinkDialog}
          >
            <LinkIcon className="h-4 w-4" />
          </ToolBtn>
          {editor.isActive("link") && (
            <ToolBtn
              label="Remove link"
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              <Unlink className="h-4 w-4" />
            </ToolBtn>
          )}
          <ToolBtn label="Image" onClick={() => setImageOpen(true)}>
            <ImageIcon className="h-4 w-4" />
          </ToolBtn>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Braces className="h-3.5 w-3.5" />
                    Merge tags
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Insert personalization fields
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-48">
              {MERGE_TAGS.map((t) => (
                <DropdownMenuItem
                  key={t.tag}
                  onClick={() =>
                    editor.chain().focus().insertContent(t.tag).run()
                  }
                  className="font-mono text-xs"
                >
                  <span className="text-muted-foreground">{t.label}</span>
                  <span className="ml-auto text-foreground">{t.tag}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="email-editor-canvas min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="email-editor-sheet mx-auto w-full max-w-[920px] px-4 py-5 sm:px-8 sm:py-7 lg:max-w-[1040px]">
            <EditorContent editor={editor} />
          </div>
        </div>

        <LinkInsertDialog
          open={linkOpen}
          onOpenChange={setLinkOpen}
          initialUrl={linkInitial}
          onConfirm={(url) => {
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
        />
        <ImageInsertDialog
          open={imageOpen}
          onOpenChange={setImageOpen}
          onConfirm={(src, alt) => {
            editor.chain().focus().setImage({ src, alt }).run();
          }}
        />
      </div>
    </TooltipProvider>
  );
};

export default RichTextEditor;
