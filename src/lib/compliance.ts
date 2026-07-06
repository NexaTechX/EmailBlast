export interface ComplianceCheck {
  id: string;
  label: string;
  description: string;
  status: "pass" | "warn" | "fail" | "info";
  category: "overview" | "gdpr" | "canspam" | "ccpa";
}

const SPAM_WORDS = [
  "free",
  "winner",
  "cash",
  "urgent",
  "act now",
  "limited time",
  "click here",
  "buy now",
  "100%",
  "guarantee",
  "no obligation",
  "risk free",
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function analyzeCompliance(
  html: string,
  subject: string = "",
): { score: number; checks: ComplianceCheck[] } {
  const text = `${subject} ${stripHtml(html)}`.toLowerCase();
  const checks: ComplianceCheck[] = [];

  const hasUnsubscribe =
    /unsubscribe/i.test(html) || /opt.?out/i.test(html);
  checks.push({
    id: "unsubscribe",
    label: "Unsubscribe link",
    description: hasUnsubscribe
      ? "Unsubscribe language is present (footer added automatically on send)."
      : "Add unsubscribe language; a footer is injected when sending.",
    status: hasUnsubscribe ? "pass" : "warn",
    category: "overview",
  });

  const hasAddress =
    /\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|blvd|boulevard|lane|ln|drive|dr)/i.test(
      html,
    ) || /p\.?o\.?\s*box/i.test(html);
  checks.push({
    id: "address",
    label: "Physical address",
    description: hasAddress
      ? "A physical mailing address appears to be included."
      : "CAN-SPAM requires a valid physical postal address in commercial emails.",
    status: hasAddress ? "pass" : "warn",
    category: "canspam",
  });

  const spamHits = SPAM_WORDS.filter((w) => text.includes(w));
  checks.push({
    id: "spam-words",
    label: "Spam trigger words",
    description:
      spamHits.length === 0
        ? "No common spam trigger words detected."
        : `Found ${spamHits.length} potential trigger word(s): ${spamHits.slice(0, 5).join(", ")}`,
    status: spamHits.length === 0 ? "pass" : spamHits.length <= 2 ? "warn" : "fail",
    category: "overview",
  });

  const imgCount = (html.match(/<img/gi) || []).length;
  const textLen = stripHtml(html).length;
  const imageHeavy = imgCount > 3 && textLen < 200;
  checks.push({
    id: "image-ratio",
    label: "Image-to-text ratio",
    description: imageHeavy
      ? "Email is image-heavy with little text — may trigger spam filters."
      : "Text and image balance looks reasonable.",
    status: imageHeavy ? "warn" : "pass",
    category: "overview",
  });

  checks.push({
    id: "consent",
    label: "Consent records",
    description:
      "Ensure all recipients opted in via your subscriber list before sending.",
    status: "info",
    category: "gdpr",
  });

  checks.push({
    id: "privacy",
    label: "Privacy policy link",
    description: /privacy/i.test(html)
      ? "Privacy policy reference found."
      : "A privacy policy link is added automatically in the send footer.",
    status: /privacy/i.test(html) ? "pass" : "info",
    category: "gdpr",
  });

  checks.push({
    id: "from-line",
    label: "Accurate sender",
    description:
      "Use a recognizable sender name and verified sending domain in campaign details.",
    status: "info",
    category: "canspam",
  });

  checks.push({
    id: "subject",
    label: "Non-deceptive subject",
    description:
      subject.trim().length > 0
        ? "Subject line is set and should reflect email content."
        : "Add a subject line before sending.",
    status: subject.trim().length > 0 ? "pass" : "fail",
    category: "canspam",
  });

  checks.push({
    id: "opt-out",
    label: "Opt-out mechanism",
    description: hasUnsubscribe
      ? "Clear opt-out mechanism will be included on send."
      : "Opt-out footer is injected automatically when the campaign is sent.",
    status: "pass",
    category: "canspam",
  });

  checks.push({
    id: "gdpr-forgotten",
    label: "Right to be forgotten",
    description:
      "Unsubscribe removes recipients from future sends via your subscriber list.",
    status: "pass",
    category: "gdpr",
  });

  checks.push({
    id: "ccpa-know",
    label: "Right to know",
    description:
      "Link to your privacy policy so recipients can learn how data is used.",
    status: "info",
    category: "ccpa",
  });

  const weights = { pass: 100, info: 85, warn: 60, fail: 30 };
  const score = Math.round(
    checks.reduce((sum, c) => sum + weights[c.status], 0) / checks.length,
  );

  return { score, checks };
}
