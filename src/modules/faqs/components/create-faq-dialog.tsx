"use client";

import { LoaderCircle, Plus, X } from "lucide-react";
import { useActionState, useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createFaqAction, type CreateFaqState } from "../actions";

const initialState: CreateFaqState = {
  status: "idle",
  values: { question: "", answer: "", sortOrder: "" },
  revision: 0,
};

export function CreateFaqDialog({ compact = false }: { compact?: boolean }) {
  const [state, formAction, pending] = useActionState(createFaqAction, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const summaryId = useId();
  const questionError = fieldError(state, "question");
  const answerError = fieldError(state, "answer");
  const sortOrderError = fieldError(state, "sortOrder");

  useEffect(() => {
    if (state.status !== "error") return;
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }, [state.revision, state.status]);

  function closeDialog() {
    if (!pending) dialogRef.current?.close();
  }

  return (
    <>
      <Button className={compact ? "min-h-9" : undefined} onClick={() => dialogRef.current?.showModal()} ref={triggerRef} type="button">
        <Plus />
        سؤال جديد
      </Button>
      <dialog
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(calc(100%-2rem),640px)] overflow-y-auto rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30"
        onCancel={(event) => { if (pending) event.preventDefault(); }}
        onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <form action={formAction} className="p-5 sm:p-6" noValidate ref={formRef}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold" id={titleId}>إنشاء سؤال شائع</h2>
              <p className="mt-1.5 max-w-[55ch] text-sm leading-6 text-text-secondary" id={descriptionId}>أدخل السؤال وإجابته. سيُحفظ كسؤال مسودة ولن يظهر للعامة قبل نشره.</p>
            </div>
            <button aria-label="إغلاق نافذة إنشاء السؤال" className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:text-muted-foreground" disabled={pending} onClick={closeDialog} type="button"><X className="size-4" /></button>
          </div>

          {state.status === "error" ? (
            <div aria-live="polite" className="mt-5 rounded-md border border-destructive/25 bg-danger-soft p-3 text-sm text-destructive" id={summaryId} role="alert">
              <p className="font-semibold">{state.message}</p>
              {state.fieldErrors ? <ul className="mt-1.5 list-inside list-disc leading-6">{Object.entries(state.fieldErrors).map(([field, errors]) => errors?.[0] ? <li key={field}><a className="underline underline-offset-2" href={`#faq-create-${field}`}>{errors[0]}</a></li> : null)}</ul> : null}
            </div>
          ) : null}

          <div className="mt-5 grid gap-5" key={state.revision}>
            <Field id="faq-create-question" label="السؤال" error={questionError}>
              <Input aria-describedby={questionError ? `faq-create-question-error ${summaryId}` : undefined} aria-invalid={Boolean(questionError)} autoFocus className="min-h-11 border-border-strong bg-card text-base focus-visible:border-primary focus-visible:ring-ring/25" defaultValue={state.values.question} id="faq-create-question" name="question" placeholder="مثال: كم تستغرق أعمال تركيب المظلة؟" />
            </Field>
            <Field id="faq-create-answer" label="الإجابة" error={answerError}>
              <Textarea aria-describedby={answerError ? `faq-create-answer-error ${summaryId}` : undefined} aria-invalid={Boolean(answerError)} className="min-h-36 resize-y border-border-strong bg-card text-base leading-7 focus-visible:border-primary focus-visible:ring-ring/25" defaultValue={state.values.answer} id="faq-create-answer" name="answer" />
            </Field>
            <Field id="faq-create-sortOrder" label="ترتيب العرض" error={sortOrderError} hint="اختياري. الرقم الأصغر يظهر أولاً عند استخدام ترتيب الأسئلة.">
              <Input aria-describedby={`faq-create-sortOrder-hint${sortOrderError ? ` faq-create-sortOrder-error ${summaryId}` : ""}`} aria-invalid={Boolean(sortOrderError)} className="min-h-11 max-w-48 border-border-strong bg-card text-base focus-visible:border-primary focus-visible:ring-ring/25" defaultValue={state.values.sortOrder} dir="ltr" id="faq-create-sortOrder" min="0" name="sortOrder" type="number" />
            </Field>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button disabled={pending} onClick={closeDialog} type="button" variant="secondary">إلغاء</Button>
            <Button aria-describedby={state.status === "error" ? summaryId : undefined} disabled={pending} type="submit">{pending ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Plus />}{pending ? "جارٍ إنشاء السؤال" : "إنشاء كمسودة"}</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><label className="text-sm font-semibold" htmlFor={id}>{label}</label>{children}{hint ? <p className="text-sm leading-6 text-muted-foreground" id={`${id}-hint`}>{hint}</p> : null}{error ? <p className="text-sm font-medium leading-6 text-destructive" id={`${id}-error`}>{error}</p> : null}</div>;
}

function fieldError(state: CreateFaqState, name: string) {
  return state.fieldErrors?.[name]?.[0];
}
