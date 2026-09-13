"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CmsFieldShell, CmsInput, CmsTextarea } from "@/modules/cms/components/form";
import type { CmsRelationOption } from "@/modules/cms/types";
import type { MediaPickerItem } from "@/modules/media/components/media-picker";
import { ServiceEditorSubmit } from "@/modules/services/components/service-editor-submit";
import { ServiceMediaField } from "@/modules/services/components/service-media-field";
import { ServiceRelationSelector } from "@/modules/services/components/service-relation-selector";
import { ServiceTextEditor } from "@/modules/services/components/service-text-editor";

import { submitSolutionAction, type SolutionFormState, type SolutionFormValues } from "../actions";

type SolutionFormVersion = {
  title: string | null;
  slug: string | null;
  shortDescription: string | null;
  content: string | null;
  heroMediaId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  openGraphTitle: string | null;
  openGraphDescription: string | null;
  openGraphImageId: string | null;
  updatedAt: Date;
  services: { serviceId: string }[];
  materials: { materialId: string }[];
  projects: { projectId: string }[];
  articles: { articleId: string }[];
  faqs: { faqId: string }[];
};

type SolutionFormProps = {
  solution?: {
    id: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    publishedVersionId: string | null;
    publishedAt: Date | null;
    updatedAt: Date;
    draftVersion: SolutionFormVersion | null;
  };
  media: MediaPickerItem[];
  relationOptions: {
    services: CmsRelationOption[];
    materials: CmsRelationOption[];
    projects: CmsRelationOption[];
    articles: CmsRelationOption[];
    faqs: CmsRelationOption[];
  };
};

export function SolutionForm({ solution, media, relationOptions }: SolutionFormProps) {
  const draft = solution?.draftVersion;
  const initialValues = getInitialValues(solution?.id, draft);
  const [state, formAction] = useActionState(submitSolutionAction, { status: "idle", revision: 0 } satisfies SolutionFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const values = state.values ?? initialValues;
  const title = solution ? values.title || draft?.title || "حل بدون عنوان" : "حل جديد";

  useEffect(() => {
    if (state.status !== "error") return;
    if (state.message) toast.error(state.message, { toastId: `solution-form-${state.revision}` });
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }, [state.message, state.revision, state.status]);

  return (
    <form action={formAction} noValidate ref={formRef}>
      {solution ? <input name="solutionId" type="hidden" value={solution.id} /> : null}
      <header className="mb-6 border-b border-border pb-5">
        <Link className="inline-flex min-h-8 items-center text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring" href="/dashboard/solutions">الحلول <span aria-hidden="true" className="mx-1.5">/</span> <span className="text-foreground">{title}</span></Link>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3"><h1 className="truncate text-2xl font-bold leading-10 sm:text-[1.75rem]">{title}</h1>{solution ? <SolutionStatus status={solution.status} /> : null}</div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,820px)_300px]" key={state.revision}>
        <div className="rounded-xl border border-border bg-card px-5 sm:px-7">
          <EditorSection title="المعلومات الأساسية">
            <CmsFieldShell error={fieldError(state, "title")} id="title" label="عنوان الحل"><CmsInput aria-describedby={fieldError(state, "title") ? "title-error" : undefined} aria-invalid={Boolean(fieldError(state, "title"))} autoFocus className="min-h-12 text-lg font-semibold" id="title" name="title" defaultValue={values.title} placeholder="مثال: حلول تظليل المساحات الخارجية" /></CmsFieldShell>
            <CmsFieldShell error={fieldError(state, "shortDescription")} id="shortDescription" label="الوصف المختصر"><CmsTextarea aria-describedby={fieldError(state, "shortDescription") ? "shortDescription-error" : undefined} aria-invalid={Boolean(fieldError(state, "shortDescription"))} className="min-h-28" id="shortDescription" name="shortDescription" defaultValue={values.shortDescription} /></CmsFieldShell>
          </EditorSection>

          <EditorSection title="المحتوى">
            <label className="text-[0.8125rem] font-semibold" htmlFor="content">تفاصيل الحل</label><ServiceTextEditor defaultValue={values.content} error={fieldError(state, "content")} />
          </EditorSection>

          <EditorSection title="المحتوى المرتبط">
            <div className="border-y border-border">
              <ServiceRelationSelector label="الخدمات المرتبطة" name="relatedServiceIds" options={relationOptions.services} selectedIds={values.relatedServiceIds} />
              <ServiceRelationSelector label="المواد المرتبطة" name="relatedMaterialIds" options={relationOptions.materials} selectedIds={values.relatedMaterialIds} />
              <ServiceRelationSelector label="المشاريع المرتبطة" name="relatedProjectIds" options={relationOptions.projects} selectedIds={values.relatedProjectIds} />
              <ServiceRelationSelector label="المقالات المرتبطة" name="relatedArticleIds" options={relationOptions.articles} selectedIds={values.relatedArticleIds} />
              <ServiceRelationSelector label="الأسئلة المرتبطة" name="relatedFaqIds" options={relationOptions.faqs} selectedIds={values.relatedFaqIds} />
            </div>
          </EditorSection>
        </div>

        <aside className="grid min-w-0 gap-3 [&>details]:order-2 xl:sticky xl:top-20 xl:[&>details]:order-3">
          <section className="order-3 min-w-0 rounded-xl border border-border bg-card p-4 xl:order-1">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">النشر</h2>{solution ? <SolutionStatus status={solution.status} /> : <span className="text-xs font-medium text-muted-foreground">غير محفوظ</span>}</div>
            {solution ? <dl className="mt-4 divide-y divide-border text-xs"><MetaRow label="آخر حفظ" value={(draft?.updatedAt ?? solution.updatedAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })} /><MetaRow label="الظهور" value={solution.publishedVersionId && solution.status === "PUBLISHED" ? "منشور للعامة" : "غير منشور للعامة"} />{solution.publishedAt ? <MetaRow label="آخر نشر" value={solution.publishedAt.toLocaleDateString("ar-SA", { dateStyle: "medium" })} /> : null}</dl> : <p className="mt-3 text-xs leading-5 text-text-secondary">سيُنشأ السجل عند الحفظ أو النشر.</p>}
          </section>

          <section className="order-1 min-w-0 rounded-xl border border-border bg-card p-4 xl:order-2"><h2 className="mb-4 text-sm font-semibold">الصور</h2><div className="grid min-w-0 gap-5"><ServiceMediaField defaultValue={values.heroMediaId} error={fieldError(state, "heroMediaId")} items={media} label="الصورة الرئيسية" name="heroMediaId" /><ServiceMediaField defaultValue={values.openGraphImageId} error={fieldError(state, "openGraphImageId")} items={media} label="صورة المشاركة" name="openGraphImageId" /></div></section>

          <details className="group rounded-xl border border-border bg-card" open={hasSeoError(state) || undefined}>
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl px-4 text-sm font-semibold outline-none transition-colors hover:bg-dashboard-hover focus-visible:ring-2 focus-visible:ring-ring marker:content-none">محركات البحث<ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary>
            <div className="grid gap-4 border-t border-border p-4">
              <CmsFieldShell error={fieldError(state, "seoTitle")} id="seoTitle" label="عنوان محركات البحث"><CmsInput aria-invalid={Boolean(fieldError(state, "seoTitle"))} id="seoTitle" name="seoTitle" defaultValue={values.seoTitle} /></CmsFieldShell>
              <CmsFieldShell error={fieldError(state, "seoDescription")} id="seoDescription" label="وصف محركات البحث"><CmsTextarea aria-invalid={Boolean(fieldError(state, "seoDescription"))} id="seoDescription" name="seoDescription" defaultValue={values.seoDescription} /></CmsFieldShell>
              <CmsFieldShell error={fieldError(state, "canonicalUrl")} id="canonicalUrl" label="الرابط الأساسي"><CmsInput aria-invalid={Boolean(fieldError(state, "canonicalUrl"))} dir="ltr" id="canonicalUrl" name="canonicalUrl" defaultValue={values.canonicalUrl} /></CmsFieldShell>
              <label className="flex min-h-10 items-center gap-2 text-xs font-medium"><input className="size-4 accent-primary" name="noIndex" type="checkbox" defaultChecked={values.noIndex} />منع الفهرسة</label>
              <CmsFieldShell error={fieldError(state, "openGraphTitle")} id="openGraphTitle" label="عنوان المشاركة"><CmsInput aria-invalid={Boolean(fieldError(state, "openGraphTitle"))} id="openGraphTitle" name="openGraphTitle" defaultValue={values.openGraphTitle} /></CmsFieldShell>
              <CmsFieldShell error={fieldError(state, "openGraphDescription")} id="openGraphDescription" label="وصف المشاركة"><CmsTextarea aria-invalid={Boolean(fieldError(state, "openGraphDescription"))} className="min-h-20" id="openGraphDescription" name="openGraphDescription" defaultValue={values.openGraphDescription} /></CmsFieldShell>
            </div>
          </details>
        </aside>
      </div>

      <div className="sticky bottom-4 z-10 mt-5 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-float)] sm:flex-row sm:items-center sm:justify-between">
        <p className="hidden text-sm leading-6 text-text-secondary sm:block">احفظ الحل كمسودة للمراجعة، أو انشره عند اكتمال المحتوى والصور.</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          {solution ? <Link className={cn(buttonVariants({ variant: "outline" }), "min-h-11 w-full px-5 sm:w-auto")} href={`/preview/solutions/${solution.id}`} target="_blank">معاينة<ExternalLink /></Link> : null}
          <ServiceEditorSubmit className="min-h-11 w-full px-5 sm:w-auto" kind="save" />
          <ServiceEditorSubmit className="min-h-11 w-full px-5 sm:w-auto" kind="publish" />
        </div>
      </div>
    </form>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="grid gap-5 border-b border-border py-7 last:border-b-0 sm:py-8"><h2 className="text-lg font-semibold">{title}</h2><div className="grid gap-5">{children}</div></section>; }
function MetaRow({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0"><dt className="text-muted-foreground">{label}</dt><dd className="text-end font-medium">{value}</dd></div>; }
function SolutionStatus({ status }: { status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) {
  const label = status === "PUBLISHED" ? "منشور" : status === "ARCHIVED" ? "مؤرشف" : "مسودة";
  const tone = status === "PUBLISHED" ? "bg-success-soft text-success" : status === "ARCHIVED" ? "bg-muted text-muted-foreground" : "bg-secondary text-text-secondary";
  return <span className={`inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${tone}`}><span className="size-1.5 rounded-full bg-current" />{label}</span>;
}
function fieldError(state: SolutionFormState, name: string) { return state.fieldErrors?.[name]?.[0]; }
function hasSeoError(state: SolutionFormState) { return ["seoTitle", "seoDescription", "canonicalUrl", "openGraphTitle", "openGraphDescription", "openGraphImageId"].some((name) => fieldError(state, name)); }

function getInitialValues(solutionId: string | undefined, draft: SolutionFormVersion | null | undefined): SolutionFormValues {
  return {
    solutionId,
    title: draft?.title ?? "",
    shortDescription: draft?.shortDescription ?? "",
    content: draft?.content ?? "",
    heroMediaId: draft?.heroMediaId ?? "",
    seoTitle: draft?.seoTitle ?? "",
    seoDescription: draft?.seoDescription ?? "",
    canonicalUrl: draft?.canonicalUrl ?? "",
    noIndex: draft?.noIndex ?? false,
    openGraphTitle: draft?.openGraphTitle ?? "",
    openGraphDescription: draft?.openGraphDescription ?? "",
    openGraphImageId: draft?.openGraphImageId ?? "",
    relatedServiceIds: draft?.services.map((item) => item.serviceId) ?? [],
    relatedMaterialIds: draft?.materials.map((item) => item.materialId) ?? [],
    relatedProjectIds: draft?.projects.map((item) => item.projectId) ?? [],
    relatedArticleIds: draft?.articles.map((item) => item.articleId) ?? [],
    relatedFaqIds: draft?.faqs.map((item) => item.faqId) ?? [],
  };
}
