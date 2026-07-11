import { supabase } from "./supabase";
import type { EmailTemplate } from "./email-templates";

export type SavedEmailTemplate = {
  id: string;
  name: string;
  description: string | null;
  content: string;
  category: string | null;
  created_at?: string;
};

export async function listSavedTemplates(): Promise<SavedEmailTemplate[]> {
  const { data, error } = await supabase
    .from("email_templates")
    .select("id, name, description, content, category, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as SavedEmailTemplate[];
}

export async function saveEmailTemplate(input: {
  name: string;
  content: string;
  description?: string;
  category?: string;
}): Promise<SavedEmailTemplate> {
  const { data, error } = await supabase
    .from("email_templates")
    .insert([
      {
        name: input.name.trim(),
        content: input.content,
        description: input.description?.trim() || null,
        category: input.category || "custom",
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data as SavedEmailTemplate;
}

export async function deleteSavedTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("email_templates").delete().eq("id", id);
  if (error) throw error;
}

export function savedToGalleryTemplate(t: SavedEmailTemplate): EmailTemplate {
  const cat = (t.category || "newsletter") as EmailTemplate["category"];
  const allowed = ["newsletter", "promotional", "transactional", "announcement"] as const;
  return {
    id: t.id,
    name: t.name,
    description: t.description || "Saved template",
    category: allowed.includes(cat as (typeof allowed)[number])
      ? (cat as EmailTemplate["category"])
      : "newsletter",
    thumbnail: "📄",
    html: t.content,
  };
}
