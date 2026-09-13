"use client";

import { ArrowDown, ArrowUp, Check, ImageIcon, Plus, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { CmsInput } from "@/modules/cms/components/form";
import type { MediaPickerItem } from "@/modules/media/components/media-picker";

type GalleryItem = { mediaId: string; caption: string | null };

export function ProjectGalleryEditor({ media, initialItems, error }: { media: MediaPickerItem[]; initialItems: GalleryItem[]; error?: string }) {
  const [items, setItems] = useState(initialItems);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const availableMedia = media.filter((candidate) => !items.some((item) => item.mediaId === candidate.id));
  const normalizedQuery = query.trim().toLowerCase();
  const visibleMedia = availableMedia.filter((item) => !normalizedQuery || `${item.originalFilename} ${item.altText ?? ""}`.toLowerCase().includes(normalizedQuery));

  function move(index: number, offset: number) {
    setItems((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function openPicker() {
    setPendingIds([]);
    setQuery("");
    dialogRef.current?.showModal();
  }

  function togglePending(id: string) {
    setPendingIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function addPendingItems() {
    if (!pendingIds.length) return;
    setItems((current) => [...current, ...pendingIds.map((mediaId) => ({ mediaId, caption: "" }))]);
    setPendingIds([]);
    dialogRef.current?.close();
  }

  return (
    <fieldset className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <legend className="text-xs font-medium text-text-secondary">معرض المشروع</legend>
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">أضف عدة صور، ثم رتّبها وأضف تعليقاً اختيارياً لكل صورة.</p>
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[11px] font-medium text-text-secondary">{items.length} صورة</span>
      </div>
      {items.length ? <ol className="mt-3 grid gap-2">{items.map((item, index) => {
        const selectedMedia = media.find((candidate) => candidate.id === item.mediaId);
        return <li className="min-w-0 rounded-lg border border-border bg-background p-2 shadow-[var(--shadow-rest)]" key={item.mediaId}>
          <input name="galleryMediaIds" type="hidden" value={item.mediaId} />
          <div className="flex min-w-0 gap-3">
            {selectedMedia ? <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-secondary"><Image alt={selectedMedia.altText ?? ""} className="object-cover" fill sizes="64px" src={selectedMedia.url} /></span> : <span className="grid size-16 shrink-0 place-items-center rounded-md bg-danger-soft text-destructive"><ImageIcon className="size-5" /></span>}
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
                <bdi className="truncate text-[11px] font-medium text-text-secondary" dir="ltr">{selectedMedia?.originalFilename ?? "صورة غير متاحة"}</bdi>
                <span className="shrink-0 text-[11px] text-muted-foreground">#{index + 1}</span>
              </div>
              <label className="block min-w-0"><span className="sr-only">تعليق الصورة {index + 1}</span><CmsInput className="h-9 min-w-0 text-xs" name="galleryCaptions" onChange={(event) => setItems((current) => current.map((entry) => entry.mediaId === item.mediaId ? { ...entry, caption: event.target.value } : entry))} placeholder={`تعليق الصورة ${index + 1}`} value={item.caption ?? ""} /></label>
            </div>
          </div>
          {!selectedMedia ? <p className="mt-2 text-[11px] leading-5 text-destructive">الصورة لم تعد متاحة. أزلها أو اختر بديلاً قبل الحفظ.</p> : null}
          <div className="mt-2 flex justify-end gap-1"><IconButton disabled={index === 0} label="نقل لأعلى" onClick={() => move(index, -1)}><ArrowUp /></IconButton><IconButton disabled={index === items.length - 1} label="نقل لأسفل" onClick={() => move(index, 1)}><ArrowDown /></IconButton><IconButton danger label="إزالة" onClick={() => setItems((current) => current.filter((entry) => entry.mediaId !== item.mediaId))}><Trash2 /></IconButton></div>
        </li>;
      })}</ol> : <p className="mt-3 rounded-lg border border-dashed border-border-strong/70 px-3 py-5 text-center text-xs text-muted-foreground">لا توجد صور في المعرض.</p>}

      <button className="mt-3 flex min-h-24 w-full items-center justify-center rounded-lg border border-dashed border-border-strong/70 bg-dashboard-canvas/40 px-4 py-4 text-center outline-none transition-colors hover:border-primary hover:bg-primary-soft/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-55" disabled={!availableMedia.length} onClick={openPicker} type="button">
        <span><span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground"><Plus className="size-5" /></span><span className="mt-2 block text-sm font-semibold text-text-secondary">إضافة صور للمعرض</span><span className="mt-1 block text-xs text-muted-foreground">{availableMedia.length ? `اختر من ${availableMedia.length} صورة متاحة` : "كل الصور الموجودة مضافة بالفعل"}</span></span>
      </button>
      {error ? <p className="mt-2 text-xs font-medium leading-5 text-destructive">{error}</p> : null}

      <dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="fixed inset-0 m-auto h-[min(760px,calc(100dvh-2rem))] w-[920px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} ref={dialogRef}>
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-5"><div><h2 className="text-lg font-semibold" id={titleId}>إضافة صور للمعرض</h2><p className="mt-1 text-xs text-muted-foreground" id={descriptionId}>حدد صورة أو أكثر، ثم اضغط إضافة. الصور المضافة لن تظهر هنا مرة أخرى.</p></div><button aria-label="إغلاق نافذة الصور" className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring" onClick={() => dialogRef.current?.close()} type="button"><X className="size-4" /></button></header>
          <div className="grid gap-3 border-b border-border p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-5">
            <label className="relative block"><span className="sr-only">البحث في الصور</span><Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input autoFocus className="h-11 w-full rounded-md border border-border-strong bg-card ps-9 pe-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25" onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم الصورة أو النص البديل..." type="search" value={query} /></label>
            <div className="flex min-h-11 items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium text-text-secondary">المحدد: {pendingIds.length}</div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-dashboard-canvas/45 p-3 sm:p-5">
            {visibleMedia.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{visibleMedia.map((item) => { const active = pendingIds.includes(item.id); return <button aria-label={`تحديد ${item.originalFilename}`} aria-pressed={active} className={`group overflow-hidden rounded-lg border bg-card text-start outline-none transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${active ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-border-strong"}`} key={item.id} onClick={() => togglePending(item.id)} type="button"><span className="relative block aspect-square bg-secondary"><Image alt={item.altText ?? ""} className="object-cover" fill sizes="(min-width:1024px) 190px, (min-width:640px) 28vw, 45vw" src={item.url} />{active ? <span className="absolute end-2 top-2 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm"><Check className="size-4" /></span> : <span className="absolute end-2 top-2 size-7 rounded-full border border-card/90 bg-card/80" />}</span><span className="block p-2.5"><bdi className="block truncate text-xs font-medium" dir="ltr">{item.originalFilename}</bdi>{item.width && item.height ? <bdi className="mt-1 block text-[11px] text-muted-foreground" dir="ltr">{item.width} × {item.height}</bdi> : null}</span></button>; })}</div> : <div className="grid h-full min-h-52 place-items-center text-center"><div><ImageIcon className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 text-sm font-semibold">{availableMedia.length ? "لا توجد صور مطابقة" : "لا توجد صور متاحة"}</p><p className="mt-1 text-xs text-muted-foreground">{availableMedia.length ? "جرّب عبارة بحث أخرى." : "ارفع صوراً جديدة أو أزل صورة من المعرض لإعادة اختيارها."}</p></div></div>}
          </div>
          <footer className="flex flex-col-reverse gap-2 border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"><Button onClick={() => dialogRef.current?.close()} type="button" variant="secondary">إلغاء</Button><Button disabled={!pendingIds.length} onClick={addPendingItems} type="button"><Plus />إضافة {pendingIds.length || ""} للمعرض</Button></footer>
        </div>
      </dialog>
    </fieldset>
  );
}

function IconButton({ children, disabled, label, onClick, danger = false }: { children: React.ReactNode; disabled?: boolean; label: string; onClick: () => void; danger?: boolean }) {
  return <button aria-label={label} className={`grid size-8 place-items-center rounded-md outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35 [&_svg]:size-3.5 ${danger ? "text-destructive hover:bg-danger-soft" : "text-muted-foreground"}`} disabled={disabled} onClick={onClick} type="button">{children}</button>;
}
