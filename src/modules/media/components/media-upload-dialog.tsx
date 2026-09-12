"use client";

import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { uploadMediaAction } from "../actions";
import { mediaConfig } from "../config";

export function MediaUploadDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [filename, setFilename] = useState("");
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function selectFile(file?: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
    setFilename(file?.name ?? "");
  }

  function closeDialog() {
    dialogRef.current?.close();
    selectFile();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <Button className="min-h-11" onClick={() => dialogRef.current?.showModal()} type="button"><Upload />رفع صورة</Button>
      <dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="fixed inset-0 m-auto w-[680px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30" onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }} ref={dialogRef}>
        <form action={uploadMediaAction}>
          <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4"><div><h2 className="text-lg font-semibold" id={titleId}>رفع صورة إلى المكتبة</h2><p className="mt-1 text-sm text-muted-foreground" id={descriptionId}>اختر الصورة وراجعها قبل بدء الرفع.</p></div><button aria-label="إغلاق نافذة الرفع" className="grid size-10 place-items-center rounded-md text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring" onClick={closeDialog} type="button"><X className="size-4" /></button></header>
          <div className="p-5">
            <label className="grid min-h-56 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-border-strong bg-dashboard-canvas/45 text-center outline-none transition-colors hover:border-primary hover:bg-primary-soft/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25">
              {previewUrl ? <span className="grid w-full gap-3 p-3"><span className="relative block aspect-[16/9] overflow-hidden rounded-lg bg-secondary"><Image alt="معاينة الصورة المحددة للرفع" className="object-contain p-2" fill sizes="620px" src={previewUrl} unoptimized /></span><bdi className="truncate text-sm font-medium" dir="ltr">{filename}</bdi><span className="text-xs font-semibold text-primary">اختيار صورة أخرى</span></span> : <span className="px-6"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary-soft text-primary"><ImageIcon className="size-6" /></span><strong className="mt-4 block text-sm">اختيار صورة من الجهاز</strong><span className="mt-2 block text-xs leading-5 text-muted-foreground">JPEG أو PNG أو WebP، بحد أقصى {mediaConfig.maxUploadBytes / 1024 / 1024} ميجابايت</span></span>}
              <Input accept={mediaConfig.allowedMimeTypes.join(",")} className="sr-only" name="file" onChange={(event) => selectFile(event.target.files?.[0])} ref={inputRef} required type="file" />
            </label>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">يتحقق الخادم من محتوى الصورة الحقيقي، نوعها، حجمها، وأبعادها قبل إنشاء رابطها الدائم.</p>
          </div>
          <footer className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end"><Button onClick={closeDialog} type="button" variant="secondary">إلغاء</Button><UploadSubmit disabled={!previewUrl} /></footer>
        </form>
      </dialog>
    </>
  );
}

function UploadSubmit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return <Button disabled={disabled || pending} type="submit"><Upload />{pending ? "جارٍ رفع الصورة..." : "تأكيد ورفع الصورة"}</Button>;
}
