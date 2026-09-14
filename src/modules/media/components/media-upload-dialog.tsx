"use client";

import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { uploadMediaAction } from "../actions";
import { mediaConfig } from "../config";

type SelectedFilePreview = { file: File; name: string; url: string };

export function MediaUploadDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<SelectedFilePreview[]>([]);
  const [previews, setPreviews] = useState<SelectedFilePreview[]>([]);
  const [error, setError] = useState("");
  const titleId = useId();
  const descriptionId = useId();
  const inputId = useId();

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(
    () => () => {
      previewsRef.current.forEach((preview) =>
        URL.revokeObjectURL(preview.url),
      );
    },
    [],
  );

  function syncInputFiles(nextPreviews: SelectedFilePreview[]) {
    if (!inputRef.current) return;

    const dataTransfer = new DataTransfer();
    nextPreviews.forEach((preview) => dataTransfer.items.add(preview.file));
    inputRef.current.files = dataTransfer.files;
  }

  function updatePreviews(nextPreviews: SelectedFilePreview[]) {
    setPreviews(nextPreviews);
    syncInputFiles(nextPreviews);
  }

  function clearFiles() {
    previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url));
    previewsRef.current = [];
    setPreviews([]);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function selectFiles(fileList?: FileList | null) {
    const files = Array.from(fileList ?? []);

    if (files.length === 0) {
      syncInputFiles(previews);
      setError("");
      return;
    }

    const invalidType = files.find(
      (file) =>
        !mediaConfig.allowedMimeTypes.includes(
          file.type as (typeof mediaConfig.allowedMimeTypes)[number],
        ),
    );
    if (invalidType) {
      setError(
        `نوع الملف غير مدعوم: ${invalidType.name}. اختر صوراً بصيغة JPEG أو PNG أو WebP.`,
      );
      syncInputFiles(previews);
      return;
    }

    const oversized = files.find(
      (file) => file.size > mediaConfig.maxUploadBytes,
    );
    if (oversized) {
      setError(
        `حجم الصورة يجب ألا يتجاوز ${mediaConfig.maxUploadBytes / 1024 / 1024} ميجابايت: ${oversized.name}.`,
      );
      syncInputFiles(previews);
      return;
    }

    setError("");
    updatePreviews([
      ...previews,
      ...files.map((file) => ({
        file,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    ]);
  }

  function removeFile(index: number) {
    const removed = previews[index];
    if (!removed) return;

    URL.revokeObjectURL(removed.url);
    updatePreviews(
      previews.filter((_, previewIndex) => previewIndex !== index),
    );
    setError("");
  }

  function closeDialog() {
    dialogRef.current?.close();
    clearFiles();
  }

  const selectedCount = previews.length;

  return (
    <>
      <Button
        className="min-h-11"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        <Upload />
        رفع صور
      </Button>
      <dialog
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="fixed inset-0 m-auto max-h-[calc(100vh-2rem)] w-[680px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-dialog)] backdrop:bg-foreground/30"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        ref={dialogRef}
      >
        <form
          action={uploadMediaAction}
          className="flex max-h-[calc(100vh-2rem)] flex-col"
          onSubmit={(event) => {
            if (error || !inputRef.current?.files?.length)
              event.preventDefault();
          }}
        >
          <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold" id={titleId}>
                رفع صور إلى المكتبة
              </h2>
              <p
                className="mt-1 text-sm text-muted-foreground"
                id={descriptionId}
              >
                اختر صورة واحدة أو عدة صور وراجعها قبل بدء الرفع.
              </p>
            </div>
            <button
              aria-label="إغلاق نافذة الرفع"
              className="grid size-10 place-items-center rounded-md text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
              onClick={closeDialog}
              type="button"
            >
              <X className="size-4" />
            </button>
          </header>
          <div className="min-h-0 overflow-y-auto p-5">
            {selectedCount ? (
              <div className="grid min-h-56 place-items-center overflow-hidden rounded-xl border border-dashed border-border-strong bg-dashboard-canvas/45 text-center">
                <div className="grid w-full gap-3 p-3">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {previews.map((preview, index) => (
                      <span
                        className="relative block aspect-square overflow-hidden rounded-lg bg-secondary"
                        key={preview.url}
                      >
                        <Image
                          alt={`معاينة الصورة رقم ${index + 1}`}
                          className="object-contain p-2"
                          fill
                          sizes="150px"
                          src={preview.url}
                          unoptimized
                        />
                        <button
                          aria-label={`إزالة ${preview.name}`}
                          className="absolute end-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-destructive text-inverted shadow-sm outline-none transition-all duration-200 ease-out hover:scale-105 hover:bg-destructive/90 hover:text-inverted focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => removeFile(index)}
                          type="button"
                        >
                          <X className="size-3.5 text-inverted" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="min-w-0 text-center">
                    <bdi
                      className="block truncate text-sm font-medium"
                      dir="ltr"
                    >
                      {selectedCount === 1
                        ? previews[0]?.name
                        : `${selectedCount.toLocaleString("ar-SA")} صور محددة`}
                    </bdi>
                    <label
                      className="mt-2 inline-flex cursor-pointer text-xs font-semibold text-brand-accent-strong transition-colors hover:text-brand-accent"
                      htmlFor={inputId}
                    >
                      اختيار صور أخرى
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <label
                className="grid min-h-56 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-border-strong bg-dashboard-canvas/45 text-center outline-none transition-colors hover:border-primary hover:bg-primary-soft/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25"
                htmlFor={inputId}
              >
                <span className="px-6">
                  <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-accent-soft text-brand-accent-strong">
                    <ImageIcon className="size-6" />
                  </span>
                  <strong className="mt-4 block text-sm">
                    اختيار صور من الجهاز
                  </strong>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                    صورة واحدة أو عدة صور، JPEG أو PNG أو WebP، بحد أقصى{" "}
                    {mediaConfig.maxUploadBytes / 1024 / 1024} ميجابايت لكل صورة
                  </span>
                </span>
              </label>
            )}
            <Input
              accept={mediaConfig.allowedMimeTypes.join(",")}
              className="sr-only"
              id={inputId}
              multiple
              name="files"
              onChange={(event) => selectFiles(event.target.files)}
              ref={inputRef}
              required
              type="file"
            />
            {error ? (
              <p
                className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              يتحقق الخادم من محتوى الصورة الحقيقي، نوعها، حجمها، وأبعادها قبل
              إنشاء رابطها الدائم.
            </p>
          </div>
          <footer className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
            <Button onClick={closeDialog} type="button" variant="secondary">
              إلغاء
            </Button>
            <UploadSubmit
              count={selectedCount}
              disabled={!selectedCount || Boolean(error)}
            />
          </footer>
        </form>
      </dialog>
    </>
  );
}

function UploadSubmit({
  count,
  disabled,
}: {
  count: number;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={disabled || pending} type="submit">
      <Upload />
      {pending
        ? "جارٍ رفع الصور..."
        : count > 1
          ? `تأكيد ورفع ${count.toLocaleString("ar-SA")} صور`
          : "تأكيد ورفع الصورة"}
    </Button>
  );
}
