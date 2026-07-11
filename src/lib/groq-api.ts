import type { Lead } from "@/types/lead";
import { postJson } from "./api-client";

export type { Lead };

async function callAi<T>(body: Record<string, unknown>): Promise<T> {
  return postJson("/api/ai", body) as Promise<T>;
}

/** Generate HTML email content from a prompt (via Groq on the server). */
export async function generateContent(prompt: string): Promise<string> {
  const { content } = await callAi<{ content: string }>({
    action: "generate_content",
    prompt,
  });
  return content;
}

/** Rewrite existing HTML email content per instructions (via Groq on the server). */
export async function enhanceContent(
  content: string,
  instructions: string,
): Promise<string> {
  const data = await callAi<{ content: string }>({
    action: "enhance_content",
    content,
    instructions,
  });
  return data.content;
}

export type ScrapedLeadSource = {
  sourceUrl: string;
  markdown?: string;
  json?: unknown;
};

/** Format scraped page text into Lead objects — never invents contacts. */
export async function formatLeads(
  sources: ScrapedLeadSource[],
): Promise<Lead[]> {
  const { leads } = await callAi<{ leads: Lead[] }>({
    action: "format_leads",
    sources,
  });
  return Array.isArray(leads) ? leads : [];
}

export type SubjectSuggestion = { subject: string; preview: string };

export async function suggestSubjects(input: {
  content: string;
  subject?: string;
  tone?: string;
}): Promise<SubjectSuggestion[]> {
  const { subjects } = await callAi<{
    subjects: Array<{ subject?: string; preview?: string }>;
  }>({
    action: "suggest_subjects",
    content: input.content,
    subject: input.subject,
    tone: input.tone,
  });
  return (subjects || [])
    .filter((s) => s.subject?.trim())
    .map((s) => ({
      subject: String(s.subject).trim(),
      preview: String(s.preview || "").trim(),
    }));
}

export async function insertPersonalization(content: string): Promise<string> {
  const { content: html } = await callAi<{ content: string }>({
    action: "insert_personalization",
    content,
  });
  return html;
}

export async function summarizeCampaign(input: {
  subject?: string;
  metrics: Record<string, number | string>;
}): Promise<{ summary: string; nextSteps: string[] }> {
  const data = await callAi<{ summary?: string; nextSteps?: string[] }>({
    action: "summarize_campaign",
    subject: input.subject,
    metrics: input.metrics,
  });
  return {
    summary: data.summary || "",
    nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
  };
}
