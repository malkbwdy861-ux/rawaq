"use client";

import { useId, useState } from "react";

import type { PublicFaq } from "@/modules/faqs/components/faq-list";

export function HomeFaqAccordion({ items }: { items: PublicFaq[] }) {
  const visible = items.filter((item): item is PublicFaq & { question: string; answer: string } => Boolean(item.question && item.answer));
  const [openId, setOpenId] = useState<string | null>(visible[0]?.id ?? null);
  const instanceId = useId();

  if (!visible.length) return null;

  return <div className="border-y border-border">
    {visible.map((item) => {
      const open = item.id === openId;
      const buttonId = `${instanceId}-${item.id}-button`;
      const panelId = `${instanceId}-${item.id}-panel`;
      return <article className="border-b border-border last:border-b-0" key={item.id}>
        <h3>
          <button aria-controls={panelId} aria-expanded={open} className="flex min-h-16 w-full items-center justify-between gap-5 py-4 text-start text-[1.0625rem] font-semibold leading-[1.65] outline-none transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:text-lg" id={buttonId} onClick={() => setOpenId(open ? null : item.id)} type="button">
            <span>{item.question}</span>
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-xl font-normal text-primary">{open ? "−" : "+"}</span>
          </button>
        </h3>
        <div aria-hidden={!open} aria-labelledby={buttonId} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} id={panelId} role="region">
          <div className="overflow-hidden"><p className="max-w-[62ch] whitespace-pre-line pb-6 pe-14 text-[1.0625rem] leading-[1.85] text-text-secondary">{item.answer}</p></div>
        </div>
      </article>;
    })}
  </div>;
}
