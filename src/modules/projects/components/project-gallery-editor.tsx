"use client";

import { ArrowDown, ArrowUp, ImageIcon, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CmsInput } from "@/modules/cms/components/form";
import type { MediaPickerItem } from "@/modules/media/components/media-picker";

type GalleryItem = { mediaId: string; caption: string | null };

export function ProjectGalleryEditor({ media, initialItems, error }: { media: MediaPickerItem[]; initialItems: GalleryItem[]; error?: string }) {
  const [items, setItems] = useState(initialItems);
  const [selectedMediaId, setSelectedMediaId] = useState("");
  const availableMedia = media.filter((candidate) => !items.some((item) => item.mediaId === candidate.id));

  function move(index: number, offset: number) {
    setItems((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <fieldset className="min-w-0">
      <legend className="text-xs font-medium text-text-secondary">معرض المشروع</legend>
      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">رتّب الصور وأضف تعليقاً اختيارياً لكل صورة.</p>
      {items.length ? <ol className="mt-3 grid gap-2">{items.map((item, index) => {
        const selectedMedia = media.find((candidate) => candidate.id === item.mediaId);
        return <li className="min-w-0 rounded-lg border border-border bg-background p-2" key={item.mediaId}>
          <input name="galleryMediaIds" type="hidden" value={item.mediaId} />
          <div className="flex min-w-0 gap-2">
            {selectedMedia ? <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-secondary"><Image alt={selectedMedia.altText ?? ""} className="object-cover" fill sizes="48px" src={selectedMedia.url} /></span> : <span className="grid size-12 shrink-0 place-items-center rounded-md bg-danger-soft text-destructive"><ImageIcon className="size-4" /></span>}
            <label className="min-w-0 flex-1"><span className="sr-only">تعليق الصورة {index + 1}</span><CmsInput className="h-9 min-w-0 text-xs" name="galleryCaptions" onChange={(event) => setItems((current) => current.map((entry) => entry.mediaId === item.mediaId ? { ...entry, caption: event.target.value } : entry))} placeholder={`تعليق الصورة ${index + 1}`} value={item.caption ?? ""} /></label>
          </div>
          {!selectedMedia ? <p className="mt-2 text-[11px] leading-5 text-destructive">الصورة لم تعد متاحة. أزلها أو اختر بديلاً قبل الحفظ.</p> : null}
          <div className="mt-2 flex justify-end gap-1"><IconButton disabled={index === 0} label="نقل لأعلى" onClick={() => move(index, -1)}><ArrowUp /></IconButton><IconButton disabled={index === items.length - 1} label="نقل لأسفل" onClick={() => move(index, 1)}><ArrowDown /></IconButton><IconButton danger label="إزالة" onClick={() => setItems((current) => current.filter((entry) => entry.mediaId !== item.mediaId))}><Trash2 /></IconButton></div>
        </li>;
      })}</ol> : <p className="mt-3 rounded-lg border border-dashed border-border-strong/70 px-3 py-5 text-center text-xs text-muted-foreground">لا توجد صور في المعرض.</p>}

      <div className="mt-3 grid gap-2">
        <Select onValueChange={(value) => setSelectedMediaId(value === "NONE" ? "" : value)} value={selectedMediaId || "NONE"}><SelectTrigger className="h-10 min-w-0 border-border-strong bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent align="end"><SelectItem value="NONE">اختر صورة</SelectItem>{availableMedia.map((item) => <SelectItem key={item.id} value={item.id}>{item.originalFilename}</SelectItem>)}</SelectContent></Select>
        <Button className="w-full" disabled={!selectedMediaId} onClick={() => { if (!selectedMediaId) return; setItems((current) => [...current, { mediaId: selectedMediaId, caption: "" }]); setSelectedMediaId(""); }} type="button" variant="secondary"><Plus />إضافة إلى المعرض</Button>
      </div>
      {error ? <p className="mt-2 text-xs font-medium leading-5 text-destructive">{error}</p> : null}
    </fieldset>
  );
}

function IconButton({ children, disabled, label, onClick, danger = false }: { children: React.ReactNode; disabled?: boolean; label: string; onClick: () => void; danger?: boolean }) {
  return <button aria-label={label} className={`grid size-8 place-items-center rounded-md outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35 [&_svg]:size-3.5 ${danger ? "text-destructive hover:bg-danger-soft" : "text-muted-foreground"}`} disabled={disabled} onClick={onClick} type="button">{children}</button>;
}
