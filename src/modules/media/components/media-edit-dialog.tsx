"use client";

import { ExternalLink, LoaderCircle, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { deleteMediaAction, updateMediaMetadataAction } from "../actions";

type MediaEditItem = { id: string; url: string; originalFilename: string; altText: string | null; caption: string | null; width: number | null; height: number | null };

export function MediaActions({ item }: { item: MediaEditItem }) {
  const menuRef = useRef<HTMLDetailsElement>(null);

  return <><div className="hidden justify-end gap-1 md:flex"><MediaEditDialog item={item} /><MediaDeleteDialog item={item} /></div><details className="relative md:hidden" ref={menuRef}><summary aria-label={`إجراءات ${item.originalFilename}`} className="grid size-9 cursor-pointer list-none place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring marker:content-none"><MoreHorizontal className="size-[18px]" /></summary><div className="absolute end-0 z-10 mt-2 w-40 rounded-lg border border-border bg-card p-1 shadow-[var(--shadow-float)]"><MediaEditDialog item={item} label="تحرير" onOpen={() => menuRef.current?.removeAttribute("open")} /><MediaDeleteDialog item={item} label="حذف" onOpen={() => menuRef.current?.removeAttribute("open")} /></div></details></>;
}

export function MediaEditDialog({ item, label, onOpen }: { item: MediaEditItem; label?: string; onOpen?: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  return <><Button aria-label={`تحرير ${item.originalFilename}`} className={label ? "min-h-9 w-full justify-start px-2 text-muted-foreground" : "size-9 min-h-9 text-muted-foreground"} onClick={() => { dialogRef.current?.showModal(); onOpen?.(); }} ref={triggerRef} size={label ? "sm" : "icon"} title="تحرير الصورة" type="button" variant="ghost"><Pencil />{label}</Button><dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[720px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} onClose={() => triggerRef.current?.focus()} ref={dialogRef}>
    <form action={updateMediaMetadataAction}>
      <input name="id" type="hidden" value={item.id} />
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4"><div className="min-w-0"><h2 className="text-lg font-semibold" id={titleId}>تحرير بيانات الصورة</h2><bdi className="mt-1 block truncate text-xs text-muted-foreground" dir="ltr" id={descriptionId}>{item.originalFilename}</bdi></div><button aria-label="إغلاق نافذة التحرير" className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring" onClick={() => dialogRef.current?.close()} type="button"><X className="size-4" /></button></header>
      <div className="grid gap-5 p-5 md:grid-cols-[240px_minmax(0,1fr)]">
        <div className="min-w-0"><div className="relative aspect-square overflow-hidden rounded-lg bg-secondary"><Image alt={item.altText ?? ""} className="object-contain p-2" fill sizes="240px" src={item.url} unoptimized /></div><div className="mt-3 flex min-w-0 items-center gap-2 rounded-md bg-secondary px-2.5 py-2"><bdi className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground" dir="ltr" title={item.url}>{item.url}</bdi><a aria-label="فتح رابط الصورة" className="grid size-8 shrink-0 place-items-center rounded-md text-primary outline-none hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring" href={item.url} rel="noreferrer" target="_blank"><ExternalLink className="size-3.5" /></a></div>{item.width && item.height ? <bdi className="mt-2 block text-xs text-muted-foreground" dir="ltr">{item.width} × {item.height}</bdi> : null}</div>
        <div className="grid content-start gap-4"><label className="grid gap-2"><span className="text-sm font-semibold">النص البديل</span><Input className="min-h-11 border-border-strong bg-card" defaultValue={item.altText ?? ""} name="altText" placeholder="وصف عربي موجز لما يظهر في الصورة" /></label><label className="grid gap-2"><span className="text-sm font-semibold">التعليق</span><Textarea className="min-h-32 resize-y border-border-strong bg-card" defaultValue={item.caption ?? ""} name="caption" placeholder="تعليق اختياري" /></label></div>
      </div>
      <footer className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end"><Button onClick={() => dialogRef.current?.close()} type="button" variant="secondary">إلغاء</Button><Button type="submit">حفظ بيانات الصورة</Button></footer>
    </form>
  </dialog></>;
}

export function MediaDeleteDialog({ item, label, onOpen }: { item: Pick<MediaEditItem, "id" | "originalFilename">; label?: string; onOpen?: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  function closeDialog() {
    dialogRef.current?.close();
  }

  return <><Button aria-label={`حذف ${item.originalFilename}`} className={label ? "min-h-9 w-full justify-start px-2 text-destructive hover:bg-danger-soft hover:text-destructive" : "size-9 min-h-9 text-destructive hover:bg-danger-soft hover:text-destructive"} onClick={() => { dialogRef.current?.showModal(); onOpen?.(); }} size={label ? "sm" : "icon"} title="حذف الصورة" type="button" variant="ghost"><Trash2 />{label}</Button><dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="m-auto w-[min(calc(100%-2rem),440px)] rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30" onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }} ref={dialogRef}><form action={deleteMediaAction} className="p-5"><input name="id" type="hidden" value={item.id} /><span className="grid size-10 place-items-center rounded-md bg-danger-soft text-destructive"><Trash2 className="size-5" /></span><h2 className="mt-3 text-lg font-semibold" id={titleId}>حذف الصورة؟</h2><p className="mt-1.5 text-sm leading-6 text-text-secondary" id={descriptionId}>سيتم حذف الصورة والملف المرتبط بها نهائياً. يمكن حذفها فقط عندما لا تكون مستخدمة في المحتوى أو الإعدادات.</p><p className="mt-3 truncate rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium" dir="ltr" title={item.originalFilename}>{item.originalFilename}</p><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button onClick={closeDialog} type="button" variant="secondary">إلغاء</Button><DeleteSubmit /></div></form></dialog></>;
}

function DeleteSubmit() {
  const { pending } = useFormStatus();
  return <Button disabled={pending} type="submit" variant="destructive">{pending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}{pending ? "جارٍ الحذف" : "تأكيد الحذف"}</Button>;
}
