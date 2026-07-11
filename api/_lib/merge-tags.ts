export type MergeTagContext = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

const FALLBACK_FIRST = "there";

/** Replace {{first_name}}, {{last_name}}, {{email}} in HTML before send. */
export function applyMergeTags(html: string, ctx: MergeTagContext): string {
  if (!html) return html;
  const first = (ctx.first_name || "").trim() || FALLBACK_FIRST;
  const last = (ctx.last_name || "").trim();
  const email = (ctx.email || "").trim();

  return html
    .replace(/\{\{\s*first_name\s*\}\}/gi, escapeHtml(first))
    .replace(/\{\{\s*last_name\s*\}\}/gi, escapeHtml(last))
    .replace(/\{\{\s*email\s*\}\}/gi, escapeHtml(email));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const MERGE_TAGS = [
  { tag: "{{first_name}}", label: "First name" },
  { tag: "{{last_name}}", label: "Last name" },
  { tag: "{{email}}", label: "Email" },
] as const;
