import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Is EmailBlast really free right now?",
    a: "Yes. During the free beta you can create lists, import subscribers, send campaigns, and view analytics at no cost. Paid plans are coming later.",
  },
  {
    q: "How does the AI copywriter work?",
    a: "Describe your goal in the campaign editor and the AI drafts subject lines and body copy. You can edit everything before sending.",
  },
  {
    q: "What do I need to send email?",
    a: "Verify a domain in Resend, add your sender details and physical mailing address in Settings → Sending, import subscribers to a list, then create and send a campaign.",
  },
  {
    q: "Can I import my existing subscribers?",
    a: "Yes. Upload a CSV or paste data on the Subscribers page. Assign imports to a list so campaigns can target them.",
  },
  {
    q: "Are automations and paid plans available?",
    a: "Not yet. Automations, team seats, and billing are planned after the beta. The app is honest about what works today.",
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
            Building in public during the free beta.
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
