"use client";

import { Eye, LoaderCircle, Pencil, Plus, Save, Send, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useId, useRef } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { deleteFaqAction, submitFaqDialogAction, type FaqDialogState } from "../actions";

type FaqDialogRecord = {
  id: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  draftVersion: { question: string | null; answer: string | null } | null;
  publishedVersion: { question: string | null; answer: string | null } | null;
};

export function CreateFaqDialog({ compact = false }: { compact?: boolean }) {
  return <FaqDialog compact={compact} />;
}

export function FaqDialog({ faq, compact = false }: { faq?: FaqDialogRecord; compact?: boolean }) {
  const version = faq?.draftVersion ?? faq?.publishedVersion;
  const initialState: FaqDialogState = {
    status: "idle",
    values: { question: version?.question ?? "", answer: version?.answer ?? "" },
    revision: 0,
  };
  const [state, formAction, pending] = useActionState(submitFaqDialogAction, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const summaryId = useId();
  const prefix = `faq-${faq?.id ?? "create"}`;
  const questionError = fieldError(state, "question");
  const answerError = fieldError(state, "answer");

  useEffect(() => {
    if (state.status !== "error") return;
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }, [state.revision, state.status]);

  function closeDialog() {
    if (!pending) dialogRef.current?.close();
  }

  return (
    <>
      <Button aria-label={faq ? `تحرير ${version?.question ?? "السؤال"}` : undefined} className={faq ? "size-9 min-h-9 text-muted-foreground" : compact ? "min-h-9" : undefined} onClick={() => dialogRef.current?.showModal()} ref={triggerRef} title={faq ? "تحرير السؤال" : undefined} type="button" variant={faq ? "ghost" : "default"} size={faq ? "icon" : "default"}>
        {faq ? <Pencil /> : <><Plus />سؤال جديد</>}
      </Button>

      <dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="m-auto max-h-[calc(100dvh-2rem)] w-[min(calc(100%-2rem),680px)] overflow-y-auto rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30" onCancel={(event) => { if (pending) event.preventDefault(); }} onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }} onClose={() => triggerRef.current?.focus()} ref={dialogRef}>
        <form action={formAction} className="p-5 sm:p-6" noValidate ref={formRef}>
          {faq ? <input name="faqId" type="hidden" value={faq.id} /> : null}
          <div className="flex items-start justify-between gap-4">
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-semibold" id={titleId}>{faq ? "تحديث السؤال" : "إنشاء سؤال شائع"}</h2>{faq ? <Status status={faq.status} /> : null}</div><p className="mt-1.5 max-w-[55ch] text-sm leading-6 text-text-secondary" id={descriptionId}>{faq ? "عدّل المحتوى، ثم احفظه كمسودة أو انشره." : "أدخل السؤال وإجابته، ثم احفظه كمسودة أو انشره مباشرة."}</p></div>
            <button aria-label="إغلاق نافذة السؤال" className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:text-muted-foreground" disabled={pending} onClick={closeDialog} type="button"><X className="size-4" /></button>
          </div>

          {state.status === "error" ? <div aria-live="polite" className="mt-5 rounded-md border border-destructive/25 bg-danger-soft p-3 text-sm text-destructive" id={summaryId} role="alert"><p className="font-semibold">{state.message}</p>{state.fieldErrors ? <ul className="mt-1.5 list-inside list-disc leading-6">{Object.entries(state.fieldErrors).map(([field, errors]) => errors?.[0] ? <li key={field}><a className="underline underline-offset-2" href={`#${prefix}-${field}`}>{errors[0]}</a></li> : null)}</ul> : null}</div> : null}

          <div className="mt-5 grid gap-5" key={state.revision}>
            <Field id={`${prefix}-question`} label="السؤال" error={questionError}><Input aria-describedby={questionError ? `${prefix}-question-error ${summaryId}` : undefined} aria-invalid={Boolean(questionError)} autoFocus className="min-h-11 border-border-strong bg-card text-base focus-visible:border-primary focus-visible:ring-ring/25" defaultValue={state.values.question} id={`${prefix}-question`} name="question" placeholder="مثال: كم تستغرق أعمال تركيب المظلة؟" /></Field>
            <Field id={`${prefix}-answer`} label="الإجابة" error={answerError}><Textarea aria-describedby={answerError ? `${prefix}-answer-error ${summaryId}` : undefined} aria-invalid={Boolean(answerError)} className="min-h-36 resize-y border-border-strong bg-card text-base leading-7 focus-visible:border-primary focus-visible:ring-ring/25" defaultValue={state.values.answer} id={`${prefix}-answer`} name="answer" /></Field>
          </div>

          <div className="mt-7 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">{faq ? <Link className={cn(buttonVariants({ variant: "secondary" }), "min-h-11")} href={`/preview/faqs/${faq.id}`} target="_blank"><Eye />معاينة</Link> : null}<Button disabled={pending} onClick={closeDialog} type="button" variant="secondary">إلغاء</Button></div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row"><Button disabled={pending} name="intent" type="submit" value="draft" variant="outline"><Save />حفظ كمسودة</Button><Button aria-describedby={state.status === "error" ? summaryId : undefined} disabled={pending} name="intent" type="submit" value="publish">{pending ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Send />}{pending ? "جارٍ الحفظ..." : "نشر"}</Button></div>
          </div>
        </form>
      </dialog>
    </>
  );
}

export function DeleteFaqDialog({ faqId, question }: { faqId: string; question?: string | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <Button aria-label={`حذف ${question ?? "السؤال"}`} className="size-9 min-h-9 text-destructive hover:bg-danger-soft hover:text-destructive" onClick={() => dialogRef.current?.showModal()} title="حذف السؤال" type="button" variant="ghost" size="icon">
        <Trash2 />
      </Button>
      <dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="m-auto w-[min(calc(100%-2rem),420px)] rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30" onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }} ref={dialogRef}>
        <form action={deleteFaqAction} className="p-5">
          <input name="faqId" type="hidden" value={faqId} />
          <div className="grid gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-danger-soft text-destructive"><Trash2 className="size-5" /></span>
            <div>
              <h2 className="text-lg font-semibold" id={titleId}>حذف السؤال</h2>
              <p className="mt-1.5 text-sm leading-6 text-text-secondary" id={descriptionId}>سيُحذف السؤال نهائياً من المحتوى المرتبط. لا يمكن التراجع عن هذا الإجراء.</p>
            </div>
            {question ? <p className="rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium leading-6">{question}</p> : null}
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={closeDialog} type="button" variant="secondary">إلغاء</Button>
            <Button type="submit" variant="destructive">تأكيد حذف السؤال</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><label className="text-sm font-semibold" htmlFor={id}>{label}</label>{children}{hint ? <p className="text-sm leading-6 text-muted-foreground" id={`${id}-hint`}>{hint}</p> : null}{error ? <p className="text-sm font-medium leading-6 text-destructive" id={`${id}-error`}>{error}</p> : null}</div>;
}

function Status({ status }: { status: FaqDialogRecord["status"] }) {
  const label = status === "PUBLISHED" ? "منشور" : "مسودة";
  return <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-text-secondary">{label}</span>;
}

function fieldError(state: FaqDialogState, name: string) {
  return state.fieldErrors?.[name]?.[0];
}
