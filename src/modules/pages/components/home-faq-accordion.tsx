"use client";

import { useId, useState } from "react";

import type { PublicFaq } from "@/modules/faqs/components/faq-list";

export function HomeFaqAccordion({ items }: { items: PublicFaq[] }) {
  const visible = items.filter((item): item is PublicFaq & { question: string; answer: string } => Boolean(item.question && item.answer));
  const [openId, setOpenId] = useState<string | null>(visible[0]?.id ?? null);
  const instanceId = useId();

  if (!visible.length) return null;

  return <div className="space-y-2.5">
    {visible.map((item) => {
      const open = item.id === openId;
      const buttonId = `${instanceId}-${item.id}-button`;
      const panelId = `${instanceId}-${item.id}-panel`;
      return <article className={`overflow-hidden rounded-[10px] border transition-colors duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none ${open ? "border-primary/25 bg-accent" : "border-border bg-card hover:border-border-strong hover:bg-muted/45"}`} key={item.id}>
        <h3>
          <button aria-controls={panelId} aria-expanded={open} className="grid min-h-14 w-full grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-4 px-4 py-3 text-start text-[1rem] font-semibold leading-[1.65] outline-none transition-colors duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:text-brand-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-h-[3.875rem] sm:px-5 sm:text-[1.0625rem]" id={buttonId} onClick={() => setOpenId(open ? null : item.id)} type="button">
            <span className="text-pretty">{item.question}</span>
            <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-[9px] border text-lg font-normal transition-colors duration-300 ${open ? "border-primary/25 bg-primary text-primary-foreground" : "border-border bg-background text-brand-accent-strong"}`}>{open ? "−" : "+"}</span>
          </button>
        </h3>
        <div aria-hidden={!open} aria-labelledby={buttonId} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} id={panelId} role="region">
          <div className="overflow-hidden"><p className="max-w-[58ch] whitespace-pre-line px-4 pb-5 pe-16 pt-0 text-[0.98rem] leading-[1.82] text-text-secondary sm:px-5 sm:pe-20 sm:text-[1rem]">{item.answer}</p></div>
        </div>
      </article>;
    })}
  </div>;
}
