"use client";

import { LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import { useActionState, useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { deleteProjectCategoryAction, submitProjectCategoryAction, type ProjectCategoryFormState } from "../actions";
import { ProjectCategoryIcon, projectCategoryIconOptions } from "../icons";

type CategoryRecord = { id: string; name: string; iconKey: string; description: string | null; isActive: boolean; sortOrder: number };

export function ProjectCategoryDialog({ category, compact = false }: { category?: CategoryRecord; compact?: boolean }) {
  const initialState: ProjectCategoryFormState = { status: "idle", values: { name: category?.name ?? "", iconKey: category?.iconKey ?? "building", description: category?.description ?? "", isActive: category?.isActive ?? true, sortOrder: String(category?.sortOrder ?? 0) }, revision: 0 };
  const [state, formAction, pending] = useActionState(submitProjectCategoryAction, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const prefix = `project-category-${category?.id ?? "new"}`;

  useEffect(() => {
    if (state.status !== "error") return;
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }, [state.revision, state.status]);

  function close() { if (!pending) dialogRef.current?.close(); }

  return <>
    <Button aria-label={category ? `تحرير ${category.name}` : undefined} className={category ? "size-9 min-h-9 text-muted-foreground" : compact ? "min-h-9" : undefined} onClick={() => dialogRef.current?.showModal()} ref={triggerRef} size={category ? "icon" : "default"} title={category ? "تحرير التصنيف" : undefined} type="button" variant={category ? "ghost" : "default"}>{category ? <Pencil /> : <><Plus />تصنيف جديد</>}</Button>
    <dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="m-auto max-h-[calc(100dvh-2rem)] w-[min(calc(100%-2rem),680px)] overflow-y-auto rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30" onCancel={(event) => { if (pending) event.preventDefault(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }} onClose={() => triggerRef.current?.focus()} ref={dialogRef}>
      <form action={formAction} className="p-5 sm:p-6" noValidate ref={formRef}>
        {category ? <input name="categoryId" type="hidden" value={category.id} /> : null}
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold" id={titleId}>{category ? "تحديث تصنيف المشروع" : "إنشاء تصنيف مشروع"}</h2><p className="mt-1.5 max-w-[55ch] text-sm leading-6 text-text-secondary" id={descriptionId}>يُستخدم التصنيف كشارة تعريفية للمشروع، ولا يؤثر في متطلبات النشر.</p></div><button aria-label="إغلاق نافذة التصنيف" className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring" disabled={pending} onClick={close} type="button"><X className="size-4" /></button></div>
        {state.status === "error" ? <p className="mt-5 rounded-md border border-destructive/25 bg-danger-soft p-3 text-sm font-medium text-destructive" role="alert">{state.message}</p> : null}
        <div className="mt-5 grid gap-5" key={state.revision}>
          <Field error={fieldError(state, "name")} id={`${prefix}-name`} label="اسم التصنيف"><Input aria-invalid={Boolean(fieldError(state, "name"))} autoFocus className="min-h-11 border-border-strong bg-card" defaultValue={state.values.name} id={`${prefix}-name`} name="name" /></Field>
          <fieldset><legend className="text-sm font-semibold">الأيقونة</legend><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{projectCategoryIconOptions.map((option) => <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft" key={option.key}><input className="sr-only" defaultChecked={state.values.iconKey === option.key} name="iconKey" type="radio" value={option.key} /><ProjectCategoryIcon iconKey={option.key} /><span>{option.label}</span></label>)}</div>{fieldError(state, "iconKey") ? <p className="mt-2 text-sm text-destructive">{fieldError(state, "iconKey")}</p> : null}</fieldset>
          <Field error={fieldError(state, "description")} id={`${prefix}-description`} label="الوصف (اختياري)"><Textarea aria-invalid={Boolean(fieldError(state, "description"))} className="min-h-24 border-border-strong bg-card" defaultValue={state.values.description} id={`${prefix}-description`} name="description" /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field error={fieldError(state, "sortOrder")} id={`${prefix}-sortOrder`} label="الترتيب"><Input aria-invalid={Boolean(fieldError(state, "sortOrder"))} defaultValue={state.values.sortOrder} id={`${prefix}-sortOrder`} min="0" name="sortOrder" type="number" /></Field><label className="flex min-h-11 items-center gap-3 self-end rounded-md border border-border bg-dashboard-canvas/45 px-3 text-sm font-semibold"><input className="size-4 accent-primary" defaultChecked={state.values.isActive} name="isActive" type="checkbox" />تصنيف نشط</label></div>
        </div>
        <div className="mt-7 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end"><Button disabled={pending} onClick={close} type="button" variant="secondary">إلغاء</Button><Button disabled={pending} type="submit">{pending ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : null}{pending ? "جارٍ الحفظ..." : "حفظ التصنيف"}</Button></div>
      </form>
    </dialog>
  </>;
}

export function DeleteProjectCategoryDialog({ category }: { category: Pick<CategoryRecord, "id" | "name"> }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  return <><Button aria-label={`حذف ${category.name}`} className="size-9 min-h-9 text-destructive hover:bg-danger-soft hover:text-destructive" onClick={() => dialogRef.current?.showModal()} size="icon" title="حذف التصنيف" type="button" variant="ghost"><Trash2 /></Button><dialog aria-describedby={descriptionId} aria-labelledby={titleId} className="m-auto w-[min(calc(100%-2rem),440px)] rounded-xl border border-border bg-card p-0 text-foreground shadow-[var(--shadow-float)] backdrop:bg-foreground/30" onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }} ref={dialogRef}><form action={deleteProjectCategoryAction} className="p-5"><input name="categoryId" type="hidden" value={category.id} /><span className="grid size-10 place-items-center rounded-md bg-danger-soft text-destructive"><Trash2 className="size-5" /></span><h2 className="mt-3 text-lg font-semibold" id={titleId}>حذف تصنيف المشروع</h2><p className="mt-1.5 text-sm leading-6 text-text-secondary" id={descriptionId}>سيُلغى إسناد هذا التصنيف من المشاريع الحالية، ولن تُحذف أي مشاريع.</p><p className="mt-3 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium">{category.name}</p><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button onClick={() => dialogRef.current?.close()} type="button" variant="secondary">إلغاء</Button><Button type="submit" variant="destructive">تأكيد حذف التصنيف</Button></div></form></dialog></>;
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) { return <div className="grid gap-2"><label className="text-sm font-semibold" htmlFor={id}>{label}</label>{children}{error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}</div>; }
function fieldError(state: ProjectCategoryFormState, name: string) { return state.fieldErrors?.[name]?.[0]; }
