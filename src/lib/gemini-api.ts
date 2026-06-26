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

async function callAi(body: Record<string, unknown>): Promise<any> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}): ${detail}`);
  }
  return res.json();
}

export async function generateContentWithGemini(prompt: string): Promise<string> {
  const { content } = await callAi({ action: "generate_content", prompt });
  return content;
}

export async function enhanceContentWithGemini(
  content: string,
  instructions: string,
): Promise<string> {
  const data = await callAi({ action: "enhance_content", content, instructions });
  return data.content;
}

export async function generateLeadsWithGemini(
  query: string,
  count: number = 5,
): Promise<Lead[]> {
  try {
    const { leads } = await callAi({ action: "generate_leads", query, count });
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
    const { leads } = await callAi({ action: "generate_domain_leads", domains });
    return leads as Lead[];
  } catch (error) {
    console.error("Error generating domain leads:", error);
    return [];
  }
}

export async function enrichLeadsWithGemini(leads: Lead[]): Promise<Lead[]> {
  try {
    const { leads: enriched } = await callAi({ action: "enrich_leads", leads });
    return enriched as Lead[];
  } catch (error) {
    console.error("Error enriching leads:", error);
    return leads;
  }
}
