import { useState } from "react";
import { Plus } from "lucide-react";
import { Reveal } from "./motion";

const faqs = [
  {
    q: "Is EmailBlast really free right now?",
    a: "Yes. During the free beta you can create lists, import subscribers, send campaigns, and view analytics at no cost. Paid plans are coming later.",
  },
  {
    q: "How does the AI copywriter work?",
    a: "Describe your goal in the campaign editor and the AI drafts subject lines and body copy. You edit everything before sending — nothing goes out without your approval.",
  },
  {
    q: "What do I need to send email?",
    a: "Add your sender name, reply-to email, and physical mailing address in Settings → Sending, import subscribers to a list, then create and send a campaign. EmailBlast delivers on our verified domain — no Resend setup required.",
  },
  {
    q: "Can I import my existing subscribers?",
    a: "Yes. Upload a CSV or paste data on the Subscribers page. Assign imports to a list so campaigns can target them.",
  },
  {
    q: "Are automations available?",
    a: "Yes. Create a welcome drip under Automations to email new list subscribers on a delay. Team seats and billing roll out after beta.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t bg-muted/20 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-[0.9fr_1.3fr] lg:gap-20 lg:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl sm:leading-[1.1]">
            Straight answers.
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Building in public during the free beta. More questions? Reach out
            from the app.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="border-b border-border/80 first:border-t"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-foreground"
                  aria-expanded={isOpen}
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
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
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
        </Reveal>
      </div>
    </section>
  );
}
