"use client";

import { ExternalLink, LoaderCircle, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function CmsContentActions({ id, idName, editHref, publicHref, deleteAction, entityLabel }: { id: string; idName: string; editHref: string; publicHref?: string | null; deleteAction: (formData: FormData) => Promise<void>; entityLabel: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <details className="group relative" ref={menuRef}>
        <summary aria-label={`إجراءات ${entityLabel}`} className="grid size-9 cursor-pointer list-none place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring marker:content-none"><MoreHorizontal className="size-[18px]" /></summary>
        <div className="absolute end-0 top-[calc(100%+4px)] z-20 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-[var(--shadow-float)]">
          <Link className="flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-medium outline-none hover:bg-dashboard-hover focus-visible:bg-dashboard-hover" href={editHref}><Pencil className="size-4" />تحرير {entityLabel}</Link>
          {publicHref ? <Link className="flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-medium outline-none hover:bg-dashboard-hover focus-visible:bg-dashboard-hover" href={publicHref} target="_blank"><ExternalLink className="size-4" />فتح في الموقع</Link> : null}
          <div className="my-1 border-t border-border" />
          <button className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-destructive outline-none hover:bg-danger-soft focus-visible:bg-danger-soft" onClick={() => { dialogRef.current?.showModal(); menuRef.current?.removeAttribute("open"); }} type="button"><Trash2 className="size-4" />حذف {entityLabel}</button>
        </div>
      </details>
      <dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="m-auto w-[min(calc(100%-2rem),420px)] rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-dialog)] backdrop:bg-foreground/30" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} ref={dialogRef}>
        <form action={deleteAction} className="p-5 sm:p-6">
          <input name={idName} type="hidden" value={id} />
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="text-lg font-semibold" id={titleId}>حذف {entityLabel}؟</h2><p className="mt-2 text-sm leading-6 text-text-secondary" id={descriptionId}>قد يكون هذا العنصر مستخدماً في أجزاء أخرى من الموقع. سيتم حذف {entityLabel} وإزالة ارتباطاته تلقائياً. لا يمكن التراجع عن هذا الإجراء.</p></div>
            <button aria-label="إغلاق" className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring" onClick={() => dialogRef.current?.close()} type="button"><X className="size-4" /></button>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={() => dialogRef.current?.close()} type="button" variant="secondary">إلغاء</Button>
            <DeleteButton entityLabel={entityLabel} />
          </div>
        </form>
      </dialog>
    </>
  );
}

function DeleteButton({ entityLabel }: { entityLabel: string }) {
  const { pending } = useFormStatus();
  return <Button disabled={pending} type="submit" variant="destructive">{pending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}{pending ? "جارٍ الحذف" : `حذف ${entityLabel}`}</Button>;
}
