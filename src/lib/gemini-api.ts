// Gemini API integration for content generation

const GEMINI_API_KEY = "AIzaSyAj0x2tyqFkOG7lDCHk3ShzQAxpfat4Pcc";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

interface GeminiRequestBody {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

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

export async function generateContentWithGemini(
  prompt: string,
): Promise<string> {
  try {
    // Create a prompt for Gemini to generate content
    const requestBody: GeminiRequestBody = {
      contents: [
        {
          parts: [
            {
              text: `Generate HTML content for an email marketing campaign based on this prompt: "${prompt}". 
            The content should be well-formatted with proper HTML tags including h1, h2, p, ul, li, etc. 
            Make it professional, engaging, and optimized for email marketing. 
            Include appropriate sections like greeting, body, call-to-action, and signature.
            Return ONLY the HTML content without any explanations or markdown formatting.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    };

    // Make the API request
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: GeminiResponse = await response.json();
    const generatedText = data.candidates[0]?.content.parts[0].text;

    if (!generatedText) {
      throw new Error("No text generated from Gemini API");
    }

    // Extract HTML content from the response
    let htmlContent = generatedText;

    // Clean up the response if needed
    if (htmlContent.includes("```html")) {
      htmlContent = htmlContent.split("```html")[1].split("```")[0].trim();
    } else if (htmlContent.includes("```")) {
      htmlContent = htmlContent.split("```")[1].split("```")[0].trim();
    }

    return htmlContent;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
}

export async function enhanceContentWithGemini(
  content: string,
  instructions: string,
): Promise<string> {
  try {
    // Create a prompt for Gemini to enhance existing content
    const requestBody: GeminiRequestBody = {
      contents: [
        {
          parts: [
            {
              text: `Enhance the following HTML email content according to these instructions: "${instructions}".
            
            Original content:
            ${content}
            
            Return ONLY the enhanced HTML content without any explanations or markdown formatting.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    };

    // Make the API request
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: GeminiResponse = await response.json();
    const generatedText = data.candidates[0]?.content.parts[0].text;

    if (!generatedText) {
      throw new Error("No text generated from Gemini API");
    }

    // Extract HTML content from the response
    let htmlContent = generatedText;

    // Clean up the response if needed
    if (htmlContent.includes("```html")) {
      htmlContent = htmlContent.split("```html")[1].split("```")[0].trim();
    } else if (htmlContent.includes("```")) {
      htmlContent = htmlContent.split("```")[1].split("```")[0].trim();
    }

    return htmlContent;
  } catch (error) {
    console.error("Error enhancing content with Gemini:", error);
    throw error;
  }
}

export async function generateLeadsWithGemini(
  query: string,
  count: number = 5,
): Promise<Lead[]> {
  try {
    const requestBody: GeminiRequestBody = {
      contents: [
        {
          parts: [
            {
              text: `Generate ${count} realistic business leads based on this search query: "${query}".
              Return the results as a JSON array of lead objects with these properties:
              - name: Full name of the person
              - title: Job title
              - company: Company name
              - email: Business email (realistic format)
              - phone: Phone number
              - linkedin: LinkedIn URL
              - website: Company website URL
              - industry: Industry
              - employees: Company size range
              - location: City, State/Country
              
              Return ONLY the JSON array without any explanations or markdown formatting.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: GeminiResponse = await response.json();
    const generatedText = data.candidates[0]?.content.parts[0].text;

    if (!generatedText) {
      throw new Error("No text generated from Gemini API");
    }

    // Extract JSON content from the response
    let jsonContent = generatedText;

    // Clean up the response if needed
    if (jsonContent.includes("```json")) {
      jsonContent = jsonContent.split("```json")[1].split("```")[0].trim();
    } else if (jsonContent.includes("```")) {
      jsonContent = jsonContent.split("```")[1].split("```")[0].trim();
    }

    // Parse the JSON
    const leads = JSON.parse(jsonContent) as Lead[];
    return leads;
  } catch (error) {
    console.error("Error generating leads with Gemini:", error);
    return [];
  }
}

export async function generateDomainLeadsWithGemini(
  domains: string[],
): Promise<Lead[]> {
  try {
    const requestBody: GeminiRequestBody = {
      contents: [
        {
          parts: [
            {
              text: `Generate realistic business leads for these company domains: ${domains.join(", ")}.
              For each domain, create 1-3 leads for key decision makers at the company.
              Return the results as a JSON array of lead objects with these properties:
              - name: Full name of the person
              - title: Job title (focus on C-level, VP, Director, or Manager roles)
              - company: Company name (derived from the domain)
              - email: Business email using the domain
              - phone: Phone number
              - linkedin: LinkedIn URL
              - website: Company website URL using the domain
              - industry: Industry (make an educated guess based on the domain)
              - employees: Company size range
              - location: City, State/Country
              
              Return ONLY the JSON array without any explanations or markdown formatting.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: GeminiResponse = await response.json();
    const generatedText = data.candidates[0]?.content.parts[0].text;

    if (!generatedText) {
      throw new Error("No text generated from Gemini API");
    }

    // Extract JSON content from the response
    let jsonContent = generatedText;

    // Clean up the response if needed
    if (jsonContent.includes("```json")) {
      jsonContent = jsonContent.split("```json")[1].split("```")[0].trim();
    } else if (jsonContent.includes("```")) {
      jsonContent = jsonContent.split("```")[1].split("```")[0].trim();
    }

    // Parse the JSON
    const leads = JSON.parse(jsonContent) as Lead[];
    return leads;
  } catch (error) {
    console.error("Error generating domain leads with Gemini:", error);
    return [];
  }
}

export async function enrichLeadsWithGemini(leads: Lead[]): Promise<Lead[]> {
  try {
    const requestBody: GeminiRequestBody = {
      contents: [
        {
          parts: [
            {
              text: `Enrich the following business leads with additional information.
              For each lead, add these properties if they don't exist:
              - personalEmail: Personal email address
              - directPhone: Direct phone number
              - mobile: Mobile phone number
              - education: Education background (university name)
              - previousCompanies: Array of previous companies
              - technologies: Array of technologies they likely use
              - founded: Year the company was founded
              - revenue: Revenue range
              - companySize: Description of company size
              - interests: Array of professional interests
              - confidenceScore: Number between 50-100 indicating confidence in the data
              
              Here are the leads to enrich: ${JSON.stringify(leads)}
              
              Return ONLY the enriched JSON array without any explanations or markdown formatting.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: GeminiResponse = await response.json();
    const generatedText = data.candidates[0]?.content.parts[0].text;

    if (!generatedText) {
      throw new Error("No text generated from Gemini API");
    }

    // Extract JSON content from the response
    let jsonContent = generatedText;

    // Clean up the response if needed
    if (jsonContent.includes("```json")) {
      jsonContent = jsonContent.split("```json")[1].split("```")[0].trim();
    } else if (jsonContent.includes("```")) {
      jsonContent = jsonContent.split("```")[1].split("```")[0].trim();
    }

    // Parse the JSON
    const enrichedLeads = JSON.parse(jsonContent) as Lead[];
    return enrichedLeads;
  } catch (error) {
    console.error("Error enriching leads with Gemini:", error);
    return leads; // Return original leads if enrichment fails
  }
}
