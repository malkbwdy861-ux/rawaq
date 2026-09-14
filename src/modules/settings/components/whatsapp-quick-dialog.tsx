"use client";

import { Check, MessageCircle, X } from "lucide-react";
import { useRef, useState } from "react";

import { buildWhatsAppUrl } from "../contact";

const quickActions = ["استفسار عن الأسعار", "طلب معاينة", "استشارة عن نوع المظلة"];

export function WhatsappQuickDialog({ whatsappNumber, defaultMessage }: { whatsappNumber: string; defaultMessage?: string | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedAction, setSelectedAction] = useState("");
  const href = buildWhatsAppUrl(whatsappNumber, defaultMessage, selectedAction ? { notes: selectedAction } : {});

  return <>
    <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[9px] bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover active:bg-primary-active sm:w-auto" onClick={() => dialogRef.current?.showModal()} type="button"><MessageCircle aria-hidden="true" className="size-[18px]" />بدء محادثة سريعة</button>
    <dialog className="whatsapp-dialog m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-[500px] overflow-y-auto rounded-[16px] border border-border bg-card p-0 text-foreground shadow-[var(--shadow-dialog)] backdrop:bg-foreground/50" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} onClose={() => setSelectedAction("")} ref={dialogRef}>
      <div className="border-b border-border bg-success-soft px-5 py-4 sm:px-6"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-[9px] bg-success text-primary-foreground"><MessageCircle aria-hidden="true" className="size-5" /></span><div><p className="text-xs font-semibold text-success">مظلات جدة</p><h2 className="mt-0.5 text-lg font-bold leading-[1.5]">تواصل معنا عبر واتساب</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary"><span aria-hidden="true" className="size-1.5 rounded-full bg-success" />سريع الرد خلال أوقات العمل</p></div></div><button aria-label="إغلاق نافذة واتساب" className="grid size-10 shrink-0 place-items-center rounded-full text-text-secondary transition-colors hover:bg-card hover:text-foreground" onClick={() => dialogRef.current?.close()} type="button"><X aria-hidden="true" className="size-5" /></button></div></div>
      <div className="px-5 py-5 sm:px-6 sm:py-6"><div className="rounded-[12px] bg-muted p-4"><p className="font-semibold">مرحباً، كيف يمكننا مساعدتك؟</p><p className="mt-1 text-sm leading-[1.7] text-text-secondary">اختر موضوعاً لبدء الرسالة، أو تابع مباشرة عبر واتساب.</p></div><div className="mt-5 flex flex-wrap gap-2" aria-label="مواضيع سريعة">{quickActions.map((action) => <button aria-pressed={selectedAction === action} className={`inline-flex min-h-10 items-center gap-1.5 rounded-[9px] border px-3 text-xs font-semibold transition-colors ${selectedAction === action ? "border-primary bg-primary-soft text-primary" : "border-border-strong bg-card text-text-secondary hover:border-primary hover:text-primary"}`} key={action} onClick={() => setSelectedAction((current) => current === action ? "" : action)} type="button">{selectedAction === action ? <Check aria-hidden="true" className="size-3.5" /> : null}{action}</button>)}</div><a className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[9px] bg-success px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover" href={href} rel="noopener noreferrer" target="_blank"><MessageCircle aria-hidden="true" className="size-[18px]" />متابعة عبر واتساب</a></div>
    </dialog>
  </>;
}
