// AI content + lead generation. Calls our own server function (Vercel /api/ai),
// which runs Groq server-side — no model API key ships to the browser.
// (File/function names kept for import stability; provider is now Groq, not Gemini.)

export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  linkedin?: string;
  website?: string;
  industry?: string;
  employees?: string;
  location?: string;
  personalEmail?: string;
  directPhone?: string;
  mobile?: string;
  education?: string;
  previousCompanies?: string[];
  technologies?: string[];
  founded?: string;
  revenue?: string;
  companySize?: string;
  interests?: string[];
  confidenceScore?: number;
}

import { postJson } from "./api-client";

/** POST a request to the server-side AI endpoint (/api/ai) and return its JSON. */
async function callAi<T>(body: Record<string, unknown>): Promise<T> {
  return postJson("/api/ai", body) as Promise<T>;
}

/** Generate HTML email content from a prompt (via the server-side AI). */
export async function generateContentWithGemini(prompt: string): Promise<string> {
  const { content } = await callAi<{ content: string }>({
    action: "generate_content",
    prompt,
  });
  return content;
}

/** Rewrite existing HTML email content per instructions (via the server-side AI). */
export async function enhanceContentWithGemini(
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

export async function generateLeadsWithGemini(
  query: string,
  count: number = 5,
): Promise<Lead[]> {
  try {
    const { leads } = await callAi<{ leads: Lead[] }>({
      action: "generate_leads",
      query,
      count,
    });
    return leads as Lead[];
  } catch (error) {
    console.error("Error generating leads:", error);
    return [];
  }
}

export async function generateDomainLeadsWithGemini(
  domains: string[],
): Promise<Lead[]> {
  try {
    const { leads } = await callAi<{ leads: Lead[] }>({
      action: "generate_domain_leads",
      domains,
    });
    return leads as Lead[];
  } catch (error) {
    console.error("Error generating domain leads:", error);
    return [];
  }
}

export async function enrichLeadsWithGemini(leads: Lead[]): Promise<Lead[]> {
  try {
    const { leads: enriched } = await callAi<{ leads: Lead[] }>({
      action: "enrich_leads",
      leads,
    });
    return enriched as Lead[];
  } catch (error) {
    console.error("Error enriching leads:", error);
    return leads;
  }
}
