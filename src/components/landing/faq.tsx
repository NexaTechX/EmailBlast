import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Do I need a credit card to start?",
    a: "No. The free plan lets you import contacts and send your first campaigns with no card. Upgrade only when you're ready to scale.",
  },
  {
    q: "How does the AI copywriter work?",
    a: "Describe your goal and the AI drafts subject lines and full email content in your voice. Refine tone, length, and call-to-action, then edit anything in the visual builder.",
  },
  {
    q: "Will my emails actually reach the inbox?",
    a: "Yes. We handle authentication (SPF, DKIM, DMARC), domain warm-up, and reputation monitoring so you consistently hit 99%+ deliverability.",
  },
  {
    q: "Can I import my existing subscribers?",
    a: "Upload a CSV and we clean, dedupe, and organize your list automatically — tags and segments included.",
  },
  {
    q: "Is there a limit on team members?",
    a: "Paid plans include unlimited teammates with roles and permissions, so your whole team works in one shared workspace.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-b">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:px-8 lg:py-28">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            04 — FAQ
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
            Questions, answered.
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Can't find what you're looking for?{" "}
            <span className="cursor-pointer text-foreground underline underline-offset-4">
              Talk to us
            </span>
            .
          </p>
        </div>

        <div className="-mt-2">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b first:border-t">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-[0.95rem] font-medium">{item.q}</span>
                  <Plus
                    className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-xl pb-6 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
