"use client";

import { ExternalLink, Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { deleteMediaAction, updateMediaMetadataAction } from "../actions";

type MediaEditItem = { id: string; url: string; originalFilename: string; altText: string | null; caption: string | null; width: number | null; height: number | null };

export function MediaEditDialog({ item }: { item: MediaEditItem }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  return <><Button aria-label={`تحرير ${item.originalFilename}`} className="size-9 min-h-9 text-muted-foreground" onClick={() => dialogRef.current?.showModal()} ref={triggerRef} size="icon" title="تحرير الصورة" type="button" variant="ghost"><Pencil /></Button><dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[720px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} onClose={() => triggerRef.current?.focus()} ref={dialogRef}>
    <form action={updateMediaMetadataAction}>
      <input name="id" type="hidden" value={item.id} />
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4"><div className="min-w-0"><h2 className="text-lg font-semibold" id={titleId}>تحرير بيانات الصورة</h2><bdi className="mt-1 block truncate text-xs text-muted-foreground" dir="ltr" id={descriptionId}>{item.originalFilename}</bdi></div><button aria-label="إغلاق نافذة التحرير" className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring" onClick={() => dialogRef.current?.close()} type="button"><X className="size-4" /></button></header>
      <div className="grid gap-5 p-5 md:grid-cols-[240px_minmax(0,1fr)]">
        <div className="min-w-0"><div className="relative aspect-square overflow-hidden rounded-lg bg-secondary"><Image alt={item.altText ?? ""} className="object-contain p-2" fill sizes="240px" src={item.url} unoptimized /></div><div className="mt-3 flex min-w-0 items-center gap-2 rounded-md bg-secondary px-2.5 py-2"><bdi className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground" dir="ltr" title={item.url}>{item.url}</bdi><a aria-label="فتح رابط الصورة" className="grid size-8 shrink-0 place-items-center rounded-md text-primary outline-none hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring" href={item.url} rel="noreferrer" target="_blank"><ExternalLink className="size-3.5" /></a></div>{item.width && item.height ? <bdi className="mt-2 block text-xs text-muted-foreground" dir="ltr">{item.width} × {item.height}</bdi> : null}</div>
        <div className="grid content-start gap-4"><label className="grid gap-2"><span className="text-sm font-semibold">النص البديل</span><Input className="min-h-11 border-border-strong bg-card" defaultValue={item.altText ?? ""} name="altText" placeholder="وصف عربي موجز لما يظهر في الصورة" /></label><label className="grid gap-2"><span className="text-sm font-semibold">التعليق</span><Textarea className="min-h-32 resize-y border-border-strong bg-card" defaultValue={item.caption ?? ""} name="caption" placeholder="تعليق اختياري" /></label></div>
      </div>
      <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between"><details className="group"><summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md px-3 text-sm font-semibold text-destructive outline-none hover:bg-danger-soft focus-visible:ring-2 focus-visible:ring-destructive/30"><Trash2 className="size-4" />حذف الصورة</summary><div className="mt-2 rounded-md border border-destructive/20 bg-danger-soft p-3 sm:w-72"><p className="text-xs leading-5 text-destructive">يمكن حذف الصورة فقط عندما لا تكون مستخدمة في المحتوى أو الإعدادات.</p><Button className="mt-3 w-full" formAction={deleteMediaAction} type="submit" variant="destructive">تأكيد حذف الصورة</Button></div></details><div className="flex flex-col-reverse gap-2 sm:flex-row"><Button onClick={() => dialogRef.current?.close()} type="button" variant="secondary">إلغاء</Button><Button type="submit">حفظ بيانات الصورة</Button></div></footer>
    </form>
  </dialog></>;
}
