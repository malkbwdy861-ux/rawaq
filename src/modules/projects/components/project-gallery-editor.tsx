"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CmsInput } from "@/modules/cms/components/form";
import type { MediaPickerItem } from "@/modules/media/components/media-picker";

type GalleryItem = {
  mediaId: string;
  caption: string | null;
};

export function ProjectGalleryEditor({ media, initialItems }: { media: MediaPickerItem[]; initialItems: GalleryItem[] }) {
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
    <fieldset className="grid gap-4">
      <legend className="text-lg font-semibold leading-[1.55]">معرض المشروع المرتب</legend>
      <p className="max-w-[55ch] text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">ترتيب الصور والتعليقات محفوظ داخل نسخة المسودة فقط. استخدم أزرار الترتيب لتحديد تسلسل العرض العام.</p>

      {items.length ? (
        <ol className="grid gap-3">
          {items.map((item, index) => {
            const selectedMedia = media.find((candidate) => candidate.id === item.mediaId);
            if (!selectedMedia) return null;
            return (
              <li className="grid gap-3 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-3 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:items-start" key={item.mediaId}>
                <input name="galleryMediaIds" type="hidden" value={item.mediaId} />
                <div className="relative aspect-square overflow-hidden rounded-[4px] bg-[oklch(95%_0.012_110)]">
                  <Image alt={selectedMedia.altText ?? ""} className="object-contain" fill sizes="80px" src={selectedMedia.url} />
                </div>
                <label className="grid gap-2">
                  <span className="text-[0.8125rem] font-semibold leading-[1.55]">تعليق الصورة {index + 1}</span>
                  <CmsInput name="galleryCaptions" value={item.caption ?? ""} onChange={(event) => setItems((current) => current.map((entry) => entry.mediaId === item.mediaId ? { ...entry, caption: event.target.value } : entry))} />
                  <span className="break-words text-xs text-[oklch(50%_0.014_150)]" dir="ltr">{selectedMedia.originalFilename}</span>
                </label>
                <div className="flex flex-wrap gap-2 sm:flex-col">
                  <GalleryButton disabled={index === 0} onClick={() => move(index, -1)}>للأعلى</GalleryButton>
                  <GalleryButton disabled={index === items.length - 1} onClick={() => move(index, 1)}>للأسفل</GalleryButton>
                  <GalleryButton tone="danger" onClick={() => setItems((current) => current.filter((entry) => entry.mediaId !== item.mediaId))}>إزالة</GalleryButton>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-4 text-sm text-[oklch(50%_0.014_150)]">لا توجد صور في معرض المسودة.</p>
      )}

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="grid gap-2">
          <span className="text-[0.8125rem] font-semibold leading-[1.55]">إضافة صورة موجودة</span>
          <Select value={selectedMediaId || "NONE"} onValueChange={(value) => setSelectedMediaId(value === "NONE" ? "" : value)}>
            <SelectTrigger className="min-h-11 max-w-[760px] border-border-strong bg-card text-base focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-offset-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="NONE">اختر صورة من مكتبة الوسائط</SelectItem>
              {availableMedia.map((item) => <SelectItem key={item.id} value={item.id}>{item.originalFilename}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <button
          className="min-h-11 rounded-[4px] bg-[oklch(37%_0.075_155)] px-4 py-2 text-[0.8125rem] font-semibold text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)]"
          onClick={() => {
            if (selectedMediaId) {
              setItems((current) => [...current, { mediaId: selectedMediaId, caption: "" }]);
              setSelectedMediaId("");
            }
          }}
          type="button"
        >
          إضافة إلى المعرض
        </button>
      </div>
    </fieldset>
  );
}

function GalleryButton({ children, disabled, onClick, tone = "default" }: { children: ReactNode; disabled?: boolean; onClick: () => void; tone?: "default" | "danger" }) {
  return <button className={`min-h-10 rounded-[4px] border border-[oklch(64%_0.018_145)] px-3 py-2 text-[0.8125rem] font-semibold disabled:cursor-not-allowed disabled:text-[oklch(53%_0.012_150)] ${tone === "danger" ? "text-[oklch(46%_0.16_28)]" : "text-[oklch(37%_0.075_155)]"}`} disabled={disabled} onClick={onClick} type="button">{children}</button>;
}
