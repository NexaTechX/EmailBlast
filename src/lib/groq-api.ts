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

export async function generateLeads(
  query: string,
  count: number = 5,
): Promise<Lead[]> {
  try {
    const { leads } = await callAi<{ leads: Lead[] }>({
      action: "generate_leads",
      query,
      count,
    });
    return leads;
  } catch (error) {
    console.error("Error generating leads:", error);
    return [];
  }
}

export async function generateDomainLeads(domains: string[]): Promise<Lead[]> {
  try {
    const { leads } = await callAi<{ leads: Lead[] }>({
      action: "generate_domain_leads",
      domains,
    });
    return leads;
  } catch (error) {
    console.error("Error generating domain leads:", error);
    return [];
  }
}

export async function enrichLeads(leads: Lead[]): Promise<Lead[]> {
  try {
    const { leads: enriched } = await callAi<{ leads: Lead[] }>({
      action: "enrich_leads",
      leads,
    });
    return enriched;
  } catch (error) {
    console.error("Error enriching leads:", error);
    return leads;
  }
}
