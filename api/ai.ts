import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";
import { requireAuth } from "./_lib/auth";

// Server-side AI for EmailBlast. GROQ_API_KEY stays server-side.
// Copy / subjects / insights use CONTENT_MODEL; lead formatting uses LEADS_MODEL.
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CONTENT_MODEL = "openai/gpt-oss-120b";
const LEADS_MODEL = "openai/gpt-oss-20b";

type AiBody = {
  action?: string;
  prompt?: string;
  instructions?: string;
  content?: string;
  subject?: string;
  tone?: string;
  sourceUrl?: string;
  sources?: Array<{ sourceUrl?: string; markdown?: string; json?: unknown }>;
  metrics?: Record<string, number | string>;
};

function stripFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.includes("```html"))
    return trimmed.split("```html")[1].split("```")[0].trim();
  if (trimmed.includes("```"))
    return trimmed.split("```")[1].split("```")[0].trim();
  return trimmed;
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

const FORMAT_LEADS_SYSTEM = `You format business contacts extracted from web page text into STRICT JSON.
Rules:
- Use ONLY facts present in the provided source text/JSON. Never invent emails, phones, LinkedIn URLs, names, or companies.
- If a field is not clearly present, omit it or use an empty string.
- Each lead MUST include sourceUrl matching the page it came from.
- Prefer contacts that have an email address.
- Return {"leads":[{name,title,company,email,phone,linkedin,website,industry,location,confidenceScore}]}.`;

/** POST /api/ai */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAuth(req);
  if ("error" in auth) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const body = (req.body || {}) as AiBody;
  const { action } = body;

  try {
    switch (action) {
      case "generate_content": {
        const html = stripFences(
          await chat(
            CONTENT_MODEL,
            COPY_SYSTEM,
            `Generate HTML content for an email marketing campaign based on this prompt: "${body.prompt}". Use proper HTML tags (h1, h2, p, ul, li, etc.). Make it professional, engaging, and optimized for email. Include greeting, body, a clear call-to-action, and a signature. Return ONLY the HTML.`,
          ),
        );
        return res.status(200).json({ content: html });
      }

      case "enhance_content": {
        const html = stripFences(
          await chat(
            CONTENT_MODEL,
            COPY_SYSTEM,
            `Enhance the following HTML email content according to these instructions: "${body.instructions}".\n\nOriginal content:\n${body.content}\n\nReturn ONLY the enhanced HTML.`,
          ),
        );
        return res.status(200).json({ content: html });
      }

      case "format_leads": {
        const sources = body.sources ?? [];
        if (!sources.length) {
          return res.status(400).json({ error: "sources are required" });
        }
        const raw = await chat(
          LEADS_MODEL,
          FORMAT_LEADS_SYSTEM,
          `Format contacts from these scraped pages. Do not invent any fields.\n\n${JSON.stringify(sources).slice(0, 120000)}`,
          true,
        );
        const parsed = JSON.parse(raw) as { leads?: unknown[] };
        return res.status(200).json({ leads: parsed.leads ?? [] });
      }

      case "suggest_subjects": {
        const raw = await chat(
          CONTENT_MODEL,
          'You write email subject lines. Return STRICT JSON: {"subjects":[{"subject":"...","preview":"..."}]} — exactly 5 items. No prose.',
          `Suggest 5 email subject lines and short preview texts.\nTone: ${body.tone || "professional"}.\nCurrent subject: ${body.subject || "(none)"}\nEmail HTML body:\n${(body.content || "").slice(0, 8000)}`,
          true,
        );
        const parsed = JSON.parse(raw) as {
          subjects?: Array<{ subject?: string; preview?: string }>;
        };
        return res.status(200).json({ subjects: parsed.subjects ?? [] });
      }

      case "insert_personalization": {
        const html = stripFences(
          await chat(
            CONTENT_MODEL,
            COPY_SYSTEM,
            `Add personalization merge tags to this HTML email where natural. Only use these tags: {{first_name}}, {{last_name}}, {{email}}. Do not invent subscriber data. Prefer greeting like "Hi {{first_name}},". Return ONLY the HTML.\n\n${body.content}`,
          ),
        );
        return res.status(200).json({ content: html });
      }

      case "summarize_campaign": {
        const raw = await chat(
          CONTENT_MODEL,
          'You are an email marketing analyst. Return STRICT JSON: {"summary":"...","nextSteps":["...","...","..."]}. Be concrete and brief. No fake revenue claims.',
          `Summarize this campaign performance and give 3 next steps.\nSubject: ${body.subject || "(unknown)"}\nMetrics: ${JSON.stringify(body.metrics || {})}`,
          true,
        );
        const parsed = JSON.parse(raw) as {
          summary?: string;
          nextSteps?: string[];
        };
        return res.status(200).json({
          summary: parsed.summary ?? "",
          nextSteps: parsed.nextSteps ?? [],
        });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    console.error("ai error", action, err);
    return res.status(500).json({ error: message });
  }
}
