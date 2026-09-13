"use client";

import { Check, ImageIcon, Search, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { MediaPickerItem } from "@/modules/media/components/media-picker";

export function ServiceMediaField({ items, name, defaultValue, label, error }: { items: MediaPickerItem[]; name: string; defaultValue?: string | null; label: string; error?: string }) {
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [pendingId, setPendingId] = useState(defaultValue ?? "");
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const selected = items.find((item) => item.id === selectedId);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = items.filter((item) => !normalizedQuery || `${item.originalFilename} ${item.altText ?? ""}`.toLowerCase().includes(normalizedQuery));

  function openPicker() {
    setPendingId(selectedId);
    setQuery("");
    dialogRef.current?.showModal();
  }

  function confirmSelection() {
    setSelectedId(pendingId);
    dialogRef.current?.close();
  }

  return (
    <fieldset className="w-full min-w-0 max-w-full">
      <legend className="text-xs font-medium text-text-secondary">{label}</legend>
      <input name={name} type="hidden" value={selectedId} />

      <div className="mt-2 w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-background">
        {selected ? (
          <button className="group block w-full min-w-0 max-w-full overflow-hidden text-start outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" onClick={openPicker} type="button">
            <span className="relative block aspect-[4/3] w-full min-w-0 max-w-full overflow-hidden bg-secondary"><Image alt={selected.altText ?? ""} className="object-cover transition-transform duration-200 group-hover:scale-[1.015] motion-reduce:transition-none" fill sizes="(min-width:1280px) 268px, calc(100vw - 64px)" src={selected.url} /></span>
            <span className="flex items-center gap-2 border-t border-border p-2.5"><span className="min-w-0 flex-1"><bdi className="block truncate text-xs font-medium" dir="ltr">{selected.originalFilename}</bdi>{selected.width && selected.height ? <bdi className="mt-0.5 block text-[11px] text-muted-foreground" dir="ltr">{selected.width} × {selected.height}</bdi> : null}</span><span className="text-xs font-semibold text-primary">تغيير</span></span>
          </button>
        ) : (
          <button className="grid min-h-32 w-full place-items-center border border-dashed border-border-strong/70 bg-dashboard-canvas/40 px-4 py-5 text-center outline-none transition-colors hover:border-primary hover:bg-primary-soft/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" onClick={openPicker} type="button">
            <span><span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground"><ImageIcon className="size-5" /></span><span className="mt-2 block text-sm font-semibold text-text-secondary">اختيار صورة</span><span className="mt-1 block text-xs text-muted-foreground">من مكتبة الصور</span></span>
          </button>
        )}
        {selected ? <button className="flex min-h-9 w-full items-center justify-center gap-1.5 border-t border-border text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-danger-soft hover:text-destructive focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" onClick={() => setSelectedId("")} type="button"><X className="size-3.5" />إزالة الصورة</button> : null}
      </div>
      {error ? <p className="mt-2 text-xs font-medium leading-5 text-destructive">{error}</p> : null}

      <dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="fixed inset-0 m-auto h-[min(760px,calc(100dvh-2rem))] w-[920px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30" ref={dialogRef}>
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
            <div><h2 className="text-lg font-semibold" id={titleId}>اختيار {label}</h2><p className="mt-1 text-xs text-muted-foreground" id={descriptionId}>اختر صورة واحدة ثم أكّد الاختيار.</p></div>
            <button aria-label="إغلاق" className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring" onClick={() => dialogRef.current?.close()} type="button"><X className="size-4" /></button>
          </header>

          <div className="border-b border-border p-3 sm:px-5">
            <label className="relative block"><span className="sr-only">البحث في الصور</span><Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input autoFocus className="h-10 w-full rounded-md border border-border-strong bg-card ps-9 pe-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25" onChange={(event) => setQuery(event.target.value)} placeholder="البحث باسم الصورة..." type="search" value={query} /></label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-dashboard-canvas/45 p-3 sm:p-5">
            {visibleItems.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{visibleItems.map((item) => { const active = item.id === pendingId; return <button aria-label={`اختيار ${item.originalFilename}`} aria-pressed={active} className={`group overflow-hidden rounded-lg border bg-card text-start outline-none transition-[border-color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-border-strong"}`} key={item.id} onClick={() => setPendingId(item.id)} type="button"><span className="relative block aspect-square bg-secondary"><Image alt={item.altText ?? ""} className="object-cover" fill sizes="(min-width:1024px) 190px, (min-width:640px) 28vw, 45vw" src={item.url} />{active ? <span className="absolute end-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm"><Check className="size-3.5" /></span> : null}</span><span className="block p-2.5"><bdi className="block truncate text-xs font-medium" dir="ltr">{item.originalFilename}</bdi>{item.width && item.height ? <bdi className="mt-1 block text-[11px] text-muted-foreground" dir="ltr">{item.width} × {item.height}</bdi> : null}</span></button>; })}</div> : <div className="grid h-full min-h-52 place-items-center text-center"><div><ImageIcon className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 text-sm font-semibold">{items.length ? "لا توجد صور مطابقة" : "مكتبة الصور فارغة"}</p><p className="mt-1 text-xs text-muted-foreground">{items.length ? "جرّب عبارة بحث أخرى." : "ارفع الصور من مكتبة الصور أولاً."}</p></div></div>}
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-border bg-card px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
            <Button onClick={() => dialogRef.current?.close()} type="button" variant="secondary">إلغاء</Button>
            <Button disabled={!pendingId} onClick={confirmSelection} type="button">تأكيد الاختيار</Button>
          </footer>
        </div>
      </dialog>
    </fieldset>
  );
}
