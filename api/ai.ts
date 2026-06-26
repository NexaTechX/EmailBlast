import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";

// Server-side AI for EmailBlast. The GROQ_API_KEY stays here — no model key ships
// to the browser (replaces the old client-side Gemini calls + hardcoded key).
//
// Model choice per feature:
//   - email copywriting (generate/enhance) -> openai/gpt-oss-120b (best quality)
//   - bulk lead JSON (generate/domain/enrich) -> openai/gpt-oss-20b (fast/cheap)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CONTENT_MODEL = "openai/gpt-oss-120b";
const LEADS_MODEL = "openai/gpt-oss-20b";

// Strip ```html / ``` fences a model sometimes wraps content in.
function stripFences(text: string): string {
  const t = text.trim();
  if (t.includes("```html")) return t.split("```html")[1].split("```")[0].trim();
  if (t.includes("```")) return t.split("```")[1].split("```")[0].trim();
  return t;
}

async function chat(
  model: string,
  system: string,
  user: string,
  json = false,
): Promise<string> {
  const res = await groq.chat.completions.create({
    model,
    temperature: 0.7,
    max_tokens: 8192,
    response_format: json ? { type: "json_object" } : undefined,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

const COPY_SYSTEM =
  "You are an expert email-marketing copywriter. Return ONLY the requested HTML — no explanations, no markdown code fences.";
const LEADS_SYSTEM =
  "You generate realistic sample business leads as STRICT JSON. Always return a single JSON object with a top-level \"leads\" array. No prose, no markdown.";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (req.body || {}) as { action?: string; [k: string]: any };
  const { action } = body;

  try {
    switch (action) {
      case "generate_content": {
        const html = stripFences(
          await chat(
            CONTENT_MODEL,
            COPY_SYSTEM,
            `Generate HTML content for an email marketing campaign based on this prompt: "${body.prompt}". ` +
              `Use proper HTML tags (h1, h2, p, ul, li, etc.). Make it professional, engaging, and optimized for email. ` +
              `Include greeting, body, a clear call-to-action, and a signature. Return ONLY the HTML.`,
          ),
        );
        return res.status(200).json({ content: html });
      }

      case "enhance_content": {
        const html = stripFences(
          await chat(
            CONTENT_MODEL,
            COPY_SYSTEM,
            `Enhance the following HTML email content according to these instructions: "${body.instructions}".\n\n` +
              `Original content:\n${body.content}\n\nReturn ONLY the enhanced HTML.`,
          ),
        );
        return res.status(200).json({ content: html });
      }

      case "generate_leads": {
        const raw = await chat(
          LEADS_MODEL,
          LEADS_SYSTEM,
          `Generate ${body.count ?? 5} realistic business leads for the search query: "${body.query}". ` +
            `Each lead object must have: name, title, company, email, phone, linkedin, website, industry, employees, location. ` +
            `Respond as {"leads": [ ... ]}.`,
          true,
        );
        return res.status(200).json({ leads: JSON.parse(raw).leads ?? [] });
      }

      case "generate_domain_leads": {
        const domains: string[] = body.domains ?? [];
        const raw = await chat(
          LEADS_MODEL,
          LEADS_SYSTEM,
          `Generate realistic business leads for these company domains: ${domains.join(", ")}. ` +
            `For each domain create 1-3 leads for key decision makers (C-level, VP, Director, Manager). ` +
            `Each lead must have: name, title, company, email (using the domain), phone, linkedin, website, industry, employees, location. ` +
            `Respond as {"leads": [ ... ]}.`,
          true,
        );
        return res.status(200).json({ leads: JSON.parse(raw).leads ?? [] });
      }

      case "enrich_leads": {
        const leads = body.leads ?? [];
        const raw = await chat(
          LEADS_MODEL,
          LEADS_SYSTEM,
          `Enrich these business leads with: personalEmail, directPhone, mobile, education, previousCompanies (array), ` +
            `technologies (array), founded, revenue, companySize, interests (array), confidenceScore (50-100). ` +
            `Keep existing fields. Leads: ${JSON.stringify(leads)}. Respond as {"leads": [ ... ]}.`,
          true,
        );
        return res.status(200).json({ leads: JSON.parse(raw).leads ?? leads });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err: any) {
    console.error("ai error", action, err);
    return res.status(500).json({ error: err?.message || "AI request failed" });
  }
}
