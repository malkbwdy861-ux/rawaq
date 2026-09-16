"use client";

import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { mediaConfig } from "../config";

type SelectedFilePreview = { file: File; name: string; url: string };
type UploadStage = "uploading" | "processing" | null;

export function MediaUploadDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<SelectedFilePreview[]>([]);
  const uploadRequestRef = useRef<XMLHttpRequest>(null);
  const [previews, setPreviews] = useState<SelectedFilePreview[]>([]);
  const [error, setError] = useState("");
  const [uploadStage, setUploadStage] = useState<UploadStage>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isUploading = uploadStage !== null;
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const inputId = useId();

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(
    () => () => {
      uploadRequestRef.current?.abort();
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
    uploadRequestRef.current?.abort();
    uploadRequestRef.current = null;
    setUploadStage(null);
    setUploadProgress(0);
    dialogRef.current?.close();
    clearFiles();
  }

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (error || !inputRef.current?.files?.length || isUploading) return;

    const request = new XMLHttpRequest();
    uploadRequestRef.current = request;
    setUploadStage("uploading");
    setUploadProgress(0);

    try {
      const result = await sendUploadRequest({
        formData: new FormData(event.currentTarget),
        request,
        onProgress(progress) {
          setUploadProgress(progress);
        },
        onUploadComplete() {
          setUploadProgress(100);
          setUploadStage("processing");
        },
      });

      uploadRequestRef.current = null;
      setUploadStage(null);
      setUploadProgress(0);
      dialogRef.current?.close();
      clearFiles();
      toast.success(result.message || "تم رفع الصور وحفظ بياناتها.");
      router.refresh();
    } catch (uploadError) {
      if (uploadRequestRef.current !== request) return;

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "تعذر رفع الصور. حاول مرة أخرى.",
      );
    } finally {
      if (uploadRequestRef.current === request) {
        uploadRequestRef.current = null;
        setUploadStage(null);
        setUploadProgress(0);
      }
    }
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
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        ref={dialogRef}
      >
        <form
          className="flex max-h-[calc(100vh-2rem)] flex-col"
          onSubmit={submitUpload}
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
                          disabled={isUploading}
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
              disabled={isUploading}
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
            {isUploading ? (
              <div className="mt-3" aria-live="polite">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>
                    {uploadStage === "processing"
                      ? "اكتمل الإرسال، جارٍ فحص الصورة وحفظها..."
                      : "جارٍ إرسال الصورة إلى الخادم..."}
                  </span>
                  <bdi dir="ltr">{uploadProgress}%</bdi>
                </div>
                <div
                  aria-label="تقدم رفع الصور"
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={uploadProgress}
                  className="h-2 overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                >
                  <span
                    className="block h-full rounded-full bg-primary transition-transform duration-200 ease-out"
                    style={{
                      transform: `scaleX(${uploadProgress / 100})`,
                      transformOrigin: "right",
                    }}
                  />
                </div>
              </div>
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
              pending={isUploading}
              progress={uploadProgress}
              stage={uploadStage}
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
  pending,
  progress,
  stage,
}: {
  count: number;
  disabled: boolean;
  pending: boolean;
  progress: number;
  stage: UploadStage;
}) {
  return (
    <Button disabled={disabled || pending} type="submit">
      <Upload />
      {pending
        ? stage === "processing"
          ? "جارٍ فحص الصور وحفظها..."
          : `جارٍ رفع الصور... ${progress}%`
        : count > 1
          ? `تأكيد ورفع ${count.toLocaleString("ar-SA")} صور`
          : "تأكيد ورفع الصورة"}
    </Button>
  );
}

function sendUploadRequest({
  formData,
  request,
  onProgress,
  onUploadComplete,
}: {
  formData: FormData;
  request: XMLHttpRequest;
  onProgress: (progress: number) => void;
  onUploadComplete: () => void;
}) {
  return new Promise<{ message?: string }>((resolve, reject) => {
    let processingTimer: ReturnType<typeof setTimeout> | undefined;
    const finish = (callback: () => void) => {
      if (processingTimer) clearTimeout(processingTimer);
      callback();
    };

    request.open("POST", "/api/dashboard/media");
    request.responseType = "json";

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    });
    request.upload.addEventListener("load", () => {
      onUploadComplete();
      processingTimer = setTimeout(() => {
        reject(
          new Error(
            "اكتمل إرسال الصور لكن الخادم لم ينتهِ من حفظها. حاول مرة أخرى.",
          ),
        );
        request.abort();
      }, 60_000);
    });
    request.addEventListener("load", () => {
      const response = request.response as { message?: string } | null;

      if (request.status >= 200 && request.status < 300) {
        finish(() => resolve(response ?? {}));
        return;
      }

      finish(() =>
        reject(
          new Error(response?.message || "تعذر رفع الصور. حاول مرة أخرى."),
        ),
      );
    });
    request.addEventListener("error", () => {
      finish(() =>
        reject(
          new Error(
            "انقطع الاتصال أثناء رفع الصور. تحقق من الشبكة وحاول مرة أخرى.",
          ),
        ),
      );
    });
    request.addEventListener("abort", () => {
      finish(() => reject(new DOMException("Upload aborted", "AbortError")));
    });

    request.send(formData);
  });
}
