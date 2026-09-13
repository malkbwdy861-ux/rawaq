"use client";

import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { uploadMediaAction } from "../actions";
import { mediaConfig } from "../config";

type SelectedFilePreview = { name: string; url: string };

export function MediaUploadDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<SelectedFilePreview[]>([]);
  const [error, setError] = useState("");
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => () => { previews.forEach((preview) => URL.revokeObjectURL(preview.url)); }, [previews]);

  function selectFiles(fileList?: FileList | null) {
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));

    const files = Array.from(fileList ?? []);

    if (files.length === 0) {
      setPreviews([]);
      setError("");
      return;
    }

    const invalidType = files.find((file) => !mediaConfig.allowedMimeTypes.includes(file.type as (typeof mediaConfig.allowedMimeTypes)[number]));
    if (invalidType) {
      setPreviews([]);
      setError(`نوع الملف غير مدعوم: ${invalidType.name}. اختر صوراً بصيغة JPEG أو PNG أو WebP.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const oversized = files.find((file) => file.size > mediaConfig.maxUploadBytes);
    if (oversized) {
      setPreviews([]);
      setError(`حجم الصورة يجب ألا يتجاوز ${mediaConfig.maxUploadBytes / 1024 / 1024} ميجابايت: ${oversized.name}.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError("");
    setPreviews(files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })));
  }

  function closeDialog() {
    dialogRef.current?.close();
    selectFiles();
    if (inputRef.current) inputRef.current.value = "";
  }

  const selectedCount = previews.length;

  return (
    <>
      <Button className="min-h-11" onClick={() => dialogRef.current?.showModal()} type="button"><Upload />رفع صور</Button>
      <dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="fixed inset-0 m-auto w-[680px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30" onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }} ref={dialogRef}>
        <form action={uploadMediaAction} onSubmit={(event) => { if (error || !inputRef.current?.files?.length) event.preventDefault(); }}>
          <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4"><div><h2 className="text-lg font-semibold" id={titleId}>رفع صور إلى المكتبة</h2><p className="mt-1 text-sm text-muted-foreground" id={descriptionId}>اختر صورة واحدة أو عدة صور وراجعها قبل بدء الرفع.</p></div><button aria-label="إغلاق نافذة الرفع" className="grid size-10 place-items-center rounded-md text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring" onClick={closeDialog} type="button"><X className="size-4" /></button></header>
          <div className="p-5">
            <label className="grid min-h-56 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-border-strong bg-dashboard-canvas/45 text-center outline-none transition-colors hover:border-primary hover:bg-primary-soft/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25">
              {selectedCount ? <span className="grid w-full gap-3 p-3"><span className="grid grid-cols-2 gap-2 sm:grid-cols-4">{previews.slice(0, 4).map((preview, index) => <span className="relative block aspect-square overflow-hidden rounded-lg bg-secondary" key={preview.url}><Image alt={`معاينة الصورة رقم ${index + 1}`} className="object-contain p-2" fill sizes="150px" src={preview.url} unoptimized /></span>)}</span><span className="min-w-0 text-center"><bdi className="block truncate text-sm font-medium" dir="ltr">{selectedCount === 1 ? previews[0]?.name : `${selectedCount.toLocaleString("ar-SA")} صور محددة`}</bdi>{selectedCount > 4 ? <span className="mt-1 block text-xs text-muted-foreground">وتوجد {Number(selectedCount - 4).toLocaleString("ar-SA")} صور أخرى جاهزة للرفع</span> : null}<span className="mt-2 block text-xs font-semibold text-primary">اختيار صور أخرى</span></span></span> : <span className="px-6"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary-soft text-primary"><ImageIcon className="size-6" /></span><strong className="mt-4 block text-sm">اختيار صور من الجهاز</strong><span className="mt-2 block text-xs leading-5 text-muted-foreground">صورة واحدة أو عدة صور، JPEG أو PNG أو WebP، بحد أقصى {mediaConfig.maxUploadBytes / 1024 / 1024} ميجابايت لكل صورة</span></span>}
              <Input accept={mediaConfig.allowedMimeTypes.join(",")} className="sr-only" multiple name="files" onChange={(event) => selectFiles(event.target.files)} ref={inputRef} required type="file" />
            </label>
            {error ? <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive" role="alert">{error}</p> : null}
            <p className="mt-3 text-xs leading-5 text-muted-foreground">يتحقق الخادم من محتوى الصورة الحقيقي، نوعها، حجمها، وأبعادها قبل إنشاء رابطها الدائم.</p>
          </div>
          <footer className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end"><Button onClick={closeDialog} type="button" variant="secondary">إلغاء</Button><UploadSubmit count={selectedCount} disabled={!selectedCount || Boolean(error)} /></footer>
        </form>
      </dialog>
    </>
  );
}

function UploadSubmit({ count, disabled }: { count: number; disabled: boolean }) {
  const { pending } = useFormStatus();
  return <Button disabled={disabled || pending} type="submit"><Upload />{pending ? "جارٍ رفع الصور..." : count > 1 ? `تأكيد ورفع ${count.toLocaleString("ar-SA")} صور` : "تأكيد ورفع الصورة"}</Button>;
}
