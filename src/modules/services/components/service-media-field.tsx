"use client";

import { Check, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { MediaPickerItem } from "@/modules/media/components/media-picker";

export function ServiceMediaField({ items, name, defaultValue, label }: { items: MediaPickerItem[]; name: string; defaultValue?: string | null; label: string }) {
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const selected = items.find((item) => item.id === selectedId);

  return (
    <fieldset>
      <legend className="text-xs font-medium text-text-secondary">{label}</legend>
      <input name={name} type="hidden" value={selectedId} />
       <div className="mt-2 overflow-hidden rounded-lg border border-border bg-background">
         {selected ? <div><div className="relative aspect-[4/3] bg-secondary"><Image alt={selected.altText ?? ""} className="object-cover" fill sizes="280px" src={selected.url} /></div><div className="flex items-center gap-2 border-t border-border p-2.5"><span className="min-w-0 flex-1"><bdi className="block truncate text-xs font-medium" dir="ltr">{selected.originalFilename}</bdi>{selected.width && selected.height ? <bdi className="mt-1 block text-[11px] text-muted-foreground" dir="ltr">{selected.width} × {selected.height}</bdi> : null}</span><button aria-label={`إزالة ${label}`} className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => setSelectedId("")} type="button"><X className="size-4" /></button></div></div> : <div className="grid min-h-28 place-items-center px-4 py-5 text-center text-sm text-muted-foreground"><div><span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary"><ImageIcon className="size-5" /></span><span className="mt-2 block">اختر صورة من مكتبة الوسائط</span></div></div>}
         {items.length ? <details className="group border-t border-border p-2"><summary className="flex min-h-9 cursor-pointer list-none items-center justify-center rounded-md text-xs font-semibold text-primary transition-colors hover:bg-primary-soft marker:content-none">{selected ? "تغيير الصورة" : "اختيار صورة"}</summary><div className="mt-2 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pe-1">{items.map((item) => { const active = item.id === selectedId; return <button aria-label={`اختيار ${item.originalFilename}`} aria-pressed={active} className={`relative aspect-square overflow-hidden rounded-lg border ${active ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-border-strong"}`} key={item.id} onClick={() => setSelectedId(item.id)} type="button"><Image alt={item.altText ?? ""} className="object-cover" fill sizes="120px" src={item.url} />{active ? <span className="absolute end-1 top-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span> : null}</button>; })}</div></details> : <p className="border-t border-border px-3 py-2 text-center text-xs text-muted-foreground">ارفع صورة إلى المكتبة أولاً</p>}
      </div>
    </fieldset>
  );
}
